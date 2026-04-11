import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue } from 'firebase-admin/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { createDeck, shuffleDeck, Card } from './poker/deck';
import { evaluateHand } from './poker/handEvaluator';
import { RaindexClient } from '@rainlanguage/orderbook';
import { ethers } from 'ethers';

if (!admin.apps.length) {
   admin.initializeApp();
}
const db = admin.firestore();

async function settleRainMarket(
   tournamentId: string,
   marketId: string,
   winnerAddress: string,
) {
   try {
      console.log(
         `🚀 Starting Rain Settlement for tournament: ${tournamentId}, market: ${marketId}`,
      );

      // 1. Initialize Signer & Provider locally to avoid deployment crashes
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      const adminSigner = new ethers.Wallet(
         process.env.RAIN_ADMIN_PK!,
         provider,
      );

      // 2. Initialize Raindex Client
      const clientResult = await RaindexClient.new([
         `networks:\n  base:\n    rpc: ${process.env.RPC_URL}\n    chain-id: 8453\norderbooks:\n  base:\n    address: ${process.env.ORDERBOOK_ADDRESS}`,
      ]);

      if (clientResult.error) throw new Error(clientResult.error.readableMsg);
      const client = clientResult.value;

      // 3. Generate the Vault ID (Must match the one used during market creation)
      const tournamentVaultHex = ethers.id(
         `${tournamentId}-${marketId}`,
      ) as `0x${string}`;

      // 4. Fetch the specific order for this vault
      const ordersResult = await client.getOrders([8453], {
         active: true,
         owners: [adminSigner.address as `0x${string}`],
      });

      if (ordersResult.error) throw new Error(ordersResult.error.readableMsg);

      const tournamentOrder = (ordersResult.value as any).orders.find(
         (o: any) =>
            o.vault_id === tournamentVaultHex ||
            o.vaultId === tournamentVaultHex,
      );

      if (!tournamentOrder) {
         console.log(
            `⚠️ No Rain order found for vault ${tournamentVaultHex} (${marketId})`,
         );
         return;
      }

      // 5. Generate Calldata to "Take" the order (settle it)
      // We are sending the payout to the winnerAddress
      const takeResult = await tournamentOrder.getTakeCalldata(
         0, // input amount (defined by order logic)
         0, // output amount (defined by order logic)
         winnerAddress as `0x${string}`,
         'buyExact',
         '1',
         '999999',
      );

      if (takeResult.error) throw new Error(takeResult.error.readableMsg);

      const { calldata, data } = takeResult.value as any;

      // 6. Execute the transaction on-chain
      const tx = await adminSigner.sendTransaction({
         to: process.env.ORDERBOOK_ADDRESS as `0x${string}`,
         data: (calldata || data) as `0x${string}`,
      });

      const receipt = await tx.wait();
      console.log(
         `✅ Rain Payout Complete for ${marketId}. Hash: ${receipt?.hash}`,
      );
   } catch (error: any) {
      console.error(
         `❌ Rain Settlement Error for ${marketId}:`,
         error.message || error,
      );
   }
}

// Add 'marketId' as a parameter here

// ── Start Game ────────────────────────────────────────────
export const startGame = onCall(async (request) => {
   if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
   }

   const { tournamentId } = request.data;
   if (!tournamentId) {
      throw new HttpsError('invalid-argument', 'tournamentId is required');
   }

   const tournamentRef = db.collection('tournaments').doc(tournamentId);
   const gameRef = db.collection('gameState').doc(tournamentId);

   const tournamentSnap = await tournamentRef.get();
   if (!tournamentSnap.exists) {
      throw new HttpsError('not-found', 'Tournament not found');
   }

   const tournament = tournamentSnap.data()!;

   // ✅ Get ALL registrations
   const playersSnap = await db
      .collection('tournaments')
      .doc(tournamentId)
      .collection('registrations')
      .get();

   if (playersSnap.docs.length < 2) {
      throw new HttpsError(
         'failed-precondition',
         'Need at least 2 registered players',
      );
   }

   // ✅ Build players object from ALL registrations
   const players: Record<string, any> = {};
   playersSnap.docs.forEach((doc, i) => {
      const p = doc.data();
      players[p.address] = {
         address: p.address,
         username: p.username ?? `Player ${i + 1}`,
         chips: tournament.startingStack ?? 10000,
         holeCards: [],
         status: 'active',
         currentBet: 0,
         isDealer: false,
         isSmallBlind: false,
         isBigBlind: false,
         seatIndex: i,
         lastAction: null,
         timeBank: 30,
      };
   });

   console.log(`Starting game with ${Object.keys(players).length} players`);

   const initialState = {
      tournamentId,
      phase: 'starting',
      players,
      communityCards: [],
      pot: 0,
      sidePots: [],
      currentTurn: null,
      dealerIndex: 0,
      smallBlind: Math.floor((tournament.startingStack ?? 10000) * 0.01),
      bigBlind: Math.floor((tournament.startingStack ?? 10000) * 0.02),
      currentBet: 0,
      handNumber: 0,
      turnDeadline: null,
      winners: null,
      lastUpdated: Date.now(),
   };

   await gameRef.set(initialState);
   await tournamentRef.update({ status: 'live' });

   // Deal first hand
   await dealNewHand(tournamentId, initialState);

   return { success: true, playerCount: Object.keys(players).length };
});

// ── Deal New Hand ─────────────────────────────────────────
async function dealNewHand(tournamentId: string, state: any) {
   const gameRef = db.collection('gameState').doc(tournamentId);
   const deck = shuffleDeck(createDeck());
   let deckIndex = 0;

   const players = { ...state.players };
   const activePlayers: any[] = Object.values(players).filter(
      (p: any) => p.status !== 'eliminated',
   );

   if (activePlayers.length < 2) return;

   activePlayers.forEach((p: any) => {
      players[p.address].isDealer = false;
      players[p.address].isSmallBlind = false;
      players[p.address].isBigBlind = false;
      players[p.address].currentBet = 0;
      players[p.address].lastAction = null;
      players[p.address].status = 'active'; // Reset all-in players to active for new hand
   });

   const sorted = activePlayers.sort(
      (a: any, b: any) => a.seatIndex - b.seatIndex,
   );
   const dealerIdx = state.handNumber % sorted.length;
   const sbIdx = (dealerIdx + 1) % sorted.length;
   const bbIdx = (dealerIdx + 2) % sorted.length;

   players[sorted[dealerIdx].address].isDealer = true;
   players[sorted[sbIdx].address].isSmallBlind = true;
   players[sorted[bbIdx].address].isBigBlind = true;

   players[sorted[sbIdx].address].chips -= state.smallBlind;
   players[sorted[sbIdx].address].currentBet = state.smallBlind;
   players[sorted[bbIdx].address].chips -= state.bigBlind;
   players[sorted[bbIdx].address].currentBet = state.bigBlind;

   const batch = db.batch();
   for (const player of activePlayers) {
      const handRef = gameRef.collection('privateHands').doc(player.address);
      batch.set(handRef, { holeCards: [deck[deckIndex++], deck[deckIndex++]] });
   }
   await batch.commit();

   const firstToActIdx = (bbIdx + 1) % sorted.length;
   await gameRef.update({
      phase: 'preflop',
      players,
      communityCards: [],
      pot: 0,
      currentBet: state.bigBlind,
      currentTurn: sorted[firstToActIdx].address,
      handNumber: (state.handNumber || 0) + 1,
      turnDeadline: Date.now() + 30000,
      winners: null,
      lastUpdated: Date.now(),
      _deck: deck.slice(deckIndex),
   });
}
// ── Player Action ─────────────────────────────────────────
export const playerAction = onCall(async (request) => {
   if (!request.auth)
      throw new HttpsError('unauthenticated', 'Must be authenticated');

   const {
      tournamentId,
      action,
      amount,
      playerAddress: walletAddress,
   } = request.data;
   const playerAddress = walletAddress.toLowerCase();
   const gameRef = db.collection('gameState').doc(tournamentId);
   const tourneyRef = db.collection('tournaments').doc(tournamentId);

   const gameSnap = await gameRef.get();
   if (!gameSnap.exists) throw new HttpsError('not-found', 'Game not found');

   const state = gameSnap.data()!;
   const players = { ...state.players };
   const player = players[playerAddress];

   // Ensure tournament shows live if a player is acting
   await tourneyRef.update({ status: 'live' });

   switch (action) {
      case 'fold':
         players[playerAddress].status = 'folded';
         players[playerAddress].lastAction = 'fold';
         break;
      case 'check':
         players[playerAddress].lastAction = 'check';
         break;
      case 'call': {
         const callAmount = Math.min(
            state.currentBet - player.currentBet,
            player.chips,
         );
         players[playerAddress].chips -= callAmount;
         players[playerAddress].currentBet += callAmount;
         players[playerAddress].lastAction = 'call';
         if (players[playerAddress].chips === 0)
            players[playerAddress].status = 'all-in';
         break;
      }
      case 'raise': {
         const raiseMore = amount - player.currentBet;
         players[playerAddress].chips -= raiseMore;
         players[playerAddress].currentBet = amount;
         players[playerAddress].lastAction = 'raise';
         if (players[playerAddress].chips === 0)
            players[playerAddress].status = 'all-in';
         break;
      }
      case 'all-in':
         players[playerAddress].currentBet += player.chips;
         players[playerAddress].chips = 0;
         players[playerAddress].status = 'all-in';
         players[playerAddress].lastAction = 'all-in';
         break;
   }

   const activeInHand = Object.values(players).filter(
      (p: any) => p.status === 'active' || p.status === 'all-in',
   );

   // Fold Logic (Winner gets table money)
   if (activeInHand.length === 1) {
      const winner = activeInHand[0] as any;
      const tableMoney = Object.values(players).reduce(
         (sum: number, p: any) => sum + (p.currentBet ?? 0),
         0,
      );
      const totalWon = state.pot + tableMoney;
      players[winner.address].chips += totalWon;
      Object.keys(players).forEach((addr) => (players[addr].currentBet = 0));

      await gameRef.update({
         phase: 'showdown',
         players,
         winners: [{ address: winner.address, amount: totalWon, hand: 'Fold' }],
         turnDeadline: null, // Clear timer
         lastUpdated: Date.now(),
      });

      await new Promise((r) => setTimeout(r, 4000));
      await dealNewHand(tournamentId, {
         ...state,
         players,
         handNumber: state.handNumber + 1,
      });
      return { success: true };
   }

   const newCurrentBet = Math.max(
      ...Object.values(players).map((p: any) => p.currentBet ?? 0),
   );
   const activeToTalk = Object.values(players).filter(
      (p: any) => p.status === 'active',
   );
   const allActed = activeToTalk.every(
      (p: any) => p.currentBet === newCurrentBet && p.lastAction !== null,
   );

   if (allActed) {
      const currentPotWithBets =
         state.pot +
         Object.values(players).reduce(
            (sum: number, p: any) => sum + (p.currentBet ?? 0),
            0,
         );
      const phaseUpdates = await advancePhase(
         state,
         players,
         currentPotWithBets,
      );
      await gameRef.update({
         ...phaseUpdates,
         turnDeadline: Date.now() + 25000,
         lastUpdated: Date.now(),
      });
   } else {
      const sortedActive = activeToTalk.sort(
         (a: any, b: any) => a.seatIndex - b.seatIndex,
      );
      const next = (sortedActive.find(
         (p: any) => p.seatIndex > player.seatIndex,
      ) ?? sortedActive[0]) as any;
      await gameRef.update({
         players,
         currentTurn: next.address,
         currentBet: newCurrentBet,
         turnDeadline: Date.now() + 25000, // ✅ Fix: Reset to 25 Seconds
         lastUpdated: Date.now(),
      });
   }
   return { success: true };
});
// ── Advance Phase ─────────────────────────────────────────
async function advancePhase(
   state: any,
   players: Record<string, any>,
   accumulatedPot: number,
): Promise<Record<string, any>> {
   const gameRef = db.collection('gameState').doc(state.tournamentId);
   const deck: Card[] = (await gameRef.get()).data()?._deck ?? [];

   // Reset current bets for the new street
   Object.keys(players).forEach((addr) => {
      players[addr].currentBet = 0;
      players[addr].lastAction = null;
   });

   const firstToAct =
      Object.values(players)
         .filter((p: any) => p.status === 'active')
         .sort((a: any, b: any) => a.seatIndex - b.seatIndex)[0] ?? null;

   const baseUpdate = {
      players,
      pot: accumulatedPot,
      currentTurn: firstToAct?.address ?? null,
      currentBet: 0,
   };

   switch (state.phase) {
      case 'preflop':
         return {
            ...baseUpdate,
            phase: 'flop',
            communityCards: deck.slice(0, 3),
            _deck: deck.slice(3),
         };
      case 'flop':
         return {
            ...baseUpdate,
            phase: 'turn',
            communityCards: [...state.communityCards, deck[0]],
            _deck: deck.slice(1),
         };
      case 'turn':
         return {
            ...baseUpdate,
            phase: 'river',
            communityCards: [...state.communityCards, deck[0]],
            _deck: deck.slice(1),
         };
      case 'river':
         return await determineWinners(state, players, accumulatedPot);
      default:
         return {};
   }
}

// ── Determine Winners ─────────────────────────────────────
async function determineWinners(
   state: any,
   players: Record<string, any>,
   pot: number,
): Promise<Record<string, any>> {
   const gameRef = db.collection('gameState').doc(state.tournamentId);
   const tourneyRef = db.collection('tournaments').doc(state.tournamentId);
   const eligible = Object.values(players).filter(
      (p: any) => p.status === 'active' || p.status === 'all-in',
   );

   const results = await Promise.all(
      eligible.map(async (p) => {
         const hand =
            (
               await gameRef.collection('privateHands').doc(p.address).get()
            ).data()?.holeCards ?? [];
         return {
            player: p,
            holeCards: hand,
            res: evaluateHand(hand, state.communityCards),
         };
      }),
   );

   results.sort((a, b) => b.res.score - a.res.score);
   const bestScore = results[0].res.score;
   const winners = results.filter((r) => r.res.score === bestScore);
   const share = Math.floor(pot / winners.length);

   winners.forEach((w) => {
      players[w.player.address].chips += share;
   });

   Object.keys(players).forEach((addr) => {
      players[addr].currentBet = 0;
      if (players[addr].chips <= 0) players[addr].status = 'eliminated';
   });

   const survivors = Object.values(players).filter(
      (p) => p.status !== 'eliminated',
   );
   const winnersData = winners.map((w) => ({
      address: w.player.address,
      amount: share,
      hand: w.res.description,
   }));

   await gameRef.update({
      phase: 'showdown',
      players,
      winners: winnersData,
      pot: 0,
      turnDeadline: null,
   });

   await new Promise((r) => setTimeout(r, 6000)); // Showdown delay

   if (survivors.length > 1) {
      await dealNewHand(state.tournamentId, {
         ...state,
         players,
         handNumber: state.handNumber + 1,
      });
   } else {
      // ✅ Set status to 'completed' and record winner
      const finalWinner = survivors[0]?.address ?? 'Unknown';

      await tourneyRef.update({
         status: 'completed',
         winner: finalWinner,
         completedAt: FieldValue.serverTimestamp(),
      });

      // 🚀 THE FIX: Pass 'first' as the marketId
      // This matches the ethers.id(`${tournamentId}-first`) we set up
      await settleRainMarket(state.tournamentId, 'first', finalWinner);

      await gameRef.update({ phase: 'finished', currentTurn: null });
   }
   return {};
}

// ── Auto Turn Timer ───────────────────────────────────────
export const checkTurnTimer = onSchedule(
   {
      schedule: 'every 1 minutes', // or whatever your frequency is
      invoker: 'private', // <--- This is the magic line
   },
   async () => {
      const now = Date.now();

      const activeGames = await db
         .collection('gameState')
         .where('phase', 'not-in', ['waiting', 'finished', 'showdown'])
         .get();

      for (const gameDoc of activeGames.docs) {
         const state = gameDoc.data();

         if (
            state.turnDeadline &&
            now > state.turnDeadline &&
            state.currentTurn
         ) {
            const players = { ...state.players };
            players[state.currentTurn].status = 'folded';
            players[state.currentTurn].lastAction = 'fold';

            const activePlayers: any[] = Object.values(players)
               .filter((p: any) => p.status === 'active')
               .sort((a: any, b: any) => a.seatIndex - b.seatIndex);

            const nextPlayer: any = activePlayers[0];

            await gameDoc.ref.update({
               players,
               currentTurn: nextPlayer?.address ?? null,
               turnDeadline: nextPlayer ? Date.now() + 30000 : null,
               lastUpdated: Date.now(),
            });
         }
      }
   },
);

// ── Auto-remove unconfirmed players ───────────────────────
export const autoRemoveUnconfirmed = onSchedule(
   { schedule: 'every 1 minutes', invoker: 'service-account-email-here' },
   async () => {
      const now = Date.now();
      const CONFIRM_WINDOW_MS = 20 * 60 * 1000; // 20 minutes

      // Find live tournaments
      const liveTournaments = await db
         .collection('tournaments')
         .where('status', '==', 'live')
         .get();

      for (const tournamentDoc of liveTournaments.docs) {
         const tournament = tournamentDoc.data();
         const startTime = tournament.startTime?.toMillis?.() ?? 0;
         const deadline = startTime + CONFIRM_WINDOW_MS;

         // Only process if we're past the deadline
         if (now < deadline) continue;

         // Get all registrations
         const registrationsSnap = await db
            .collection('tournaments')
            .doc(tournamentDoc.id)
            .collection('registrations')
            .get();

         const batch = db.batch();
         let removedCount = 0;

         for (const regDoc of registrationsSnap.docs) {
            const reg = regDoc.data();

            // Remove players who didn't confirm
            if (!reg.confirmed) {
               batch.update(regDoc.ref, {
                  status: 'removed',
                  removedAt: FieldValue.serverTimestamp(),
                  removedReason: 'Did not confirm seat within 20 minutes',
               });

               // Also update their status in game state if game has started
               const gameRef = db.collection('gameState').doc(tournamentDoc.id);
               const gameSnap = await gameRef.get();
               if (gameSnap.exists) {
                  const gameState = gameSnap.data()!;
                  if (gameState.players?.[reg.address]) {
                     batch.update(gameRef, {
                        [`players.${reg.address}.status`]: 'eliminated',
                        [`players.${reg.address}.lastAction`]: 'no-show',
                     });
                  }
               }

               removedCount++;
            }
         }

         if (removedCount > 0) {
            await batch.commit();
            console.log(
               `Removed ${removedCount} unconfirmed players from tournament ${tournamentDoc.id}`,
            );
         }
      }
   },
);

// ── Force Start (Manual) ──────────────────────────────────
export const startGameManually = onCall(
   {
      invoker: 'public',
      region: 'us-central1',
      cors: true,
   },
   async (request) => {
      const { tournamentId } = request.data;
      const uid = request.auth?.uid;

      if (!uid) {
         throw new HttpsError('unauthenticated', 'Must be authenticated');
      }

      const tournamentRef = db.collection('tournaments').doc(tournamentId);
      const tournamentSnap = await tournamentRef.get();

      if (!tournamentSnap.exists) {
         throw new HttpsError('not-found', 'Tournament not found');
      }

      const tournament = tournamentSnap.data()!;

      if (tournament.status === 'live') {
         return { success: false, message: 'Game already in progress' };
      }

      // ── 1. Get ALL registrations ──────────────────────────
      // Inside startGameManually
      const playersSnap = await db
         .collection('tournaments')
         .doc(tournamentId)
         .collection('registrations')
         .limit(6)
         .get(); // Force limit 6
      // const playersSnap = await db
      //    .collection('tournaments')
      //    .doc(tournamentId)
      //    .collection('registrations')
      //    .get();

      if (playersSnap.docs.length < 2) {
         throw new HttpsError(
            'failed-precondition',
            'Need at least 2 registered players to start',
         );
      }

      console.log(`Starting game with ${playersSnap.docs.length} players`);

      // ── 2. Build players — all flags false, dealNewHand assigns them ──
      const players: Record<string, any> = {};
      playersSnap.docs.forEach((doc, i) => {
         const p = doc.data();
         players[p.address] = {
            address: p.address,
            username: p.username ?? `Player ${i + 1}`,
            chips: tournament.startingStack ?? 10000,
            holeCards: [],
            status: 'active',
            currentBet: 0,
            isDealer: false, // ✅ assigned in dealNewHand
            isSmallBlind: false, // ✅ assigned in dealNewHand
            isBigBlind: false, // ✅ assigned in dealNewHand
            seatIndex: i,
            lastAction: null,
            timeBank: 30,
         };
      });

      // ── 3. Define initial game state ──────────────────────
      const initialState = {
         tournamentId,
         phase: 'starting',
         players,
         communityCards: [],
         pot: 0,
         sidePots: [],
         currentTurn: null,
         dealerIndex: 0,
         smallBlind: Math.floor((tournament.startingStack ?? 10000) * 0.01),
         bigBlind: Math.floor((tournament.startingStack ?? 10000) * 0.02),
         currentBet: 0,
         handNumber: 0,
         turnDeadline: null,
         winners: null,
         lastUpdated: Date.now(),
      };

      // ── 4. Save game state ────────────────────────────────
      const gameRef = db.collection('gameState').doc(tournamentId);
      await gameRef.set(initialState);

      // ── 5. Update tournament status ───────────────────────
      await tournamentRef.update({
         status: 'live',
         startTime: FieldValue.serverTimestamp(),
      });

      // ── 6. Deal first hand to ALL players ─────────────────
      await dealNewHand(tournamentId, initialState);

      return {
         success: true,
         playerCount: Object.keys(players).length,
      };
   },
);
