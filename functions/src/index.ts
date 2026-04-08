import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { FieldValue } from 'firebase-admin/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { createDeck, shuffleDeck, Card } from './poker/deck';
import { evaluateHand } from './poker/handEvaluator';

if (!admin.apps.length) {
   admin.initializeApp();
}
const db = admin.firestore();

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

   // ✅ Get ALL active players, not just blinds
   const activePlayers: any[] = Object.values(players).filter(
      (p: any) => p.status !== 'eliminated',
   );

   if (activePlayers.length < 2) {
      throw new HttpsError('failed-precondition', 'Need at least 2 players');
   }

   // ── Assign dealer, small blind, big blind ──
   // Reset all blind/dealer flags first
   activePlayers.forEach((p: any) => {
      players[p.address].isDealer = false;
      players[p.address].isSmallBlind = false;
      players[p.address].isBigBlind = false;
      players[p.address].currentBet = 0;
      players[p.address].lastAction = null;
      players[p.address].status = 'active';
   });

   // Assign based on seat index
   const sorted = activePlayers.sort(
      (a: any, b: any) => a.seatIndex - b.seatIndex,
   );
   const dealerIdx = state.handNumber % sorted.length;
   const sbIdx = (dealerIdx + 1) % sorted.length;
   const bbIdx = (dealerIdx + 2) % sorted.length;

   players[sorted[dealerIdx].address].isDealer = true;
   players[sorted[sbIdx].address].isSmallBlind = true;
   players[sorted[bbIdx].address].isBigBlind = true;

   // ── Post blinds ──
   players[sorted[sbIdx].address].chips -= state.smallBlind;
   players[sorted[sbIdx].address].currentBet = state.smallBlind;

   players[sorted[bbIdx].address].chips -= state.bigBlind;
   players[sorted[bbIdx].address].currentBet = state.bigBlind;

   // ── Deal 2 hole cards to EVERY active player ──
   const batch = db.batch();

   for (const player of activePlayers) {
      const card1 = deck[deckIndex++];
      const card2 = deck[deckIndex++];

      // Store privately in subcollection
      const handRef = gameRef.collection('privateHands').doc(player.address);

      batch.set(handRef, { holeCards: [card1, card2] });
   }

   await batch.commit();

   // Remaining deck for community cards
   const remainingDeck = deck.slice(deckIndex);

   // First to act is after big blind
   const firstToActIdx = (bbIdx + 1) % sorted.length;
   const firstToAct = sorted[firstToActIdx];

   await gameRef.update({
      phase: 'preflop',
      players,
      communityCards: [],
      pot: state.smallBlind + state.bigBlind,
      currentBet: state.bigBlind,
      currentTurn: firstToAct.address,
      handNumber: (state.handNumber || 0) + 1,
      turnDeadline: Date.now() + 30000,
      winners: null,
      lastUpdated: Date.now(),
      _deck: remainingDeck,
   });
}

// ── Player Action ─────────────────────────────────────────
export const playerAction = onCall(async (request) => {
   if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
   }

   const {
      tournamentId,
      action,
      amount,
      playerAddress: walletAddress,
   } = request.data;

   if (!walletAddress) {
      throw new HttpsError('invalid-argument', 'playerAddress is required');
   }
   const playerAddress: string = walletAddress.toLowerCase();

   if (!tournamentId || !action) {
      throw new HttpsError(
         'invalid-argument',
         'tournamentId and action are required',
      );
   }

   const gameRef = db.collection('gameState').doc(tournamentId);
   const gameSnap = await gameRef.get();

   if (!gameSnap.exists) {
      throw new HttpsError('not-found', 'Game not found');
   }

   const state = gameSnap.data()!;

   if (state.currentTurn?.toLowerCase() !== playerAddress) {
      throw new HttpsError('failed-precondition', 'Not your turn');
   }

   const players = { ...state.players };
   const player = players[playerAddress];

   if (!player) {
      throw new HttpsError('not-found', 'Player not found in game');
   }

   // ── Apply action ──────────────────────────────────────
   switch (action as string) {
      case 'fold':
         players[playerAddress].status = 'folded';
         players[playerAddress].lastAction = 'fold';
         break;

      case 'check':
         if (state.currentBet > player.currentBet) {
            throw new HttpsError(
               'failed-precondition',
               'Cannot check — must call or raise',
            );
         }
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
         if (!amount || amount < state.bigBlind) {
            throw new HttpsError(
               'invalid-argument',
               'Raise must be at least the big blind',
            );
         }
         const raiseMore = amount - player.currentBet;
         if (raiseMore > player.chips)
            throw new HttpsError('invalid-argument', 'Not enough chips');
         players[playerAddress].chips -= raiseMore;
         players[playerAddress].currentBet = amount;
         players[playerAddress].lastAction = 'raise';
         if (players[playerAddress].chips === 0)
            players[playerAddress].status = 'all-in';
         break;
      }

      case 'all-in': {
         const allInAmount = player.chips;
         players[playerAddress].currentBet += allInAmount;
         players[playerAddress].chips = 0;
         players[playerAddress].status = 'all-in';
         players[playerAddress].lastAction = 'all-in';
         break;
      }

      default:
         throw new HttpsError('invalid-argument', `Unknown action: ${action}`);
   }

   // ── Recalculate pot ───────────────────────────────────
   const pot = Object.values(players).reduce(
      (sum: number, p: any) => sum + (p.currentBet ?? 0),
      0,
   );
   const newCurrentBet = Math.max(
      ...Object.values(players).map((p: any) => p.currentBet ?? 0),
   );

   // ── Players still active in this hand ─────────────────
   const activeInHand: any[] = Object.values(players).filter(
      (p: any) => p.status === 'active' || p.status === 'all-in',
   );

   // ── Everyone folded except one — hand winner ──────────
   if (activeInHand.length === 1) {
      const handWinner = activeInHand[0];

      // ✅ Give pot to hand winner
      players[handWinner.address].chips += pot;

      // ✅ Reset bets
      Object.keys(players).forEach((addr) => {
         players[addr].currentBet = 0;
      });

      // ✅ Eliminate anyone with 0 chips
      Object.keys(players).forEach((addr) => {
         if (players[addr].chips <= 0) {
            players[addr].status = 'eliminated';
         }
      });

      const survivors = Object.values(players).filter(
         (p: any) => p.status !== 'eliminated',
      ) as { address: string }[];

      console.log(
         `Hand won by ${handWinner.address}. Survivors: ${survivors.length}`,
      );

      // ✅ Tournament over — only one player left
      if (survivors.length === 1) {
         await db.collection('tournaments').doc(tournamentId).update({
            status: 'completed',
            winner: survivors[0].address,
         });

         await gameRef.update({
            phase: 'finished',
            players,
            pot: 0,
            currentBet: 0,
            currentTurn: null,
            winners: [
               {
                  address: handWinner.address,
                  amount: pot,
                  hand: 'Everyone else folded',
                  isTournamentWinner: true,
               },
            ],
            lastUpdated: Date.now(),
         });

         return { success: true, tournamentOver: true };
      }

      // ✅ Game continues — show hand result briefly then deal next hand
      await gameRef.update({
         phase: 'showdown',
         players,
         pot: 0,
         currentBet: 0,
         currentTurn: null,
         winners: [
            {
               address: handWinner.address,
               amount: pot,
               hand: 'Everyone else folded',
               isTournamentWinner: false,
            },
         ],
         lastUpdated: Date.now(),
      });

      // ✅ Wait 4 seconds then deal next hand automatically
      await new Promise((resolve) => setTimeout(resolve, 4000));
      await dealNewHand(tournamentId, {
         ...state,
         players,
         handNumber: state.handNumber + 1,
      });

      return { success: true };
   }

   // ── Find next player to act ───────────────────────────
   // Only 'active' players take turns — all-in players are skipped
   const activeToTalk: any[] = Object.values(players)
      .filter((p: any) => p.status === 'active')
      .sort((a: any, b: any) => a.seatIndex - b.seatIndex);

   const currentSeatIndex = players[playerAddress].seatIndex;
   const nextPlayer = (activeToTalk.find(
      (p: any) => p.seatIndex > currentSeatIndex,
   ) ?? activeToTalk[0]) as any;

   // ── Check if betting round is over ────────────────────
   // Round ends when all active players have acted and matched the current bet
   // All-in players are excluded — they can't act anymore
   const allActed =
      activeToTalk.length === 0 ||
      activeToTalk.every(
         (p: any) => p.currentBet === newCurrentBet && p.lastAction !== null,
      );

   let updates: any = {
      players,
      pot,
      currentBet: newCurrentBet,
      lastUpdated: Date.now(),
   };

   if (allActed) {
      const phaseUpdates = await advancePhase(state, players, pot);
      updates = { ...updates, ...phaseUpdates };
   } else {
      updates.currentTurn = nextPlayer?.address ?? null;
      updates.turnDeadline = Date.now() + 30000;
   }

   await gameRef.update(updates);
   return { success: true };
});
// ── Advance Phase ─────────────────────────────────────────
async function advancePhase(
   state: any,
   players: Record<string, any>,
   pot: number,
): Promise<Record<string, any>> {
   const gameRef = db.collection('gameState').doc(state.tournamentId);
   const deckSnap = await gameRef.get();
   const deck: Card[] = deckSnap.data()?._deck ?? [];

   // Reset bets AND lastAction for every active player entering new street
   Object.keys(players).forEach((addr) => {
      if (
         players[addr].status === 'active' ||
         players[addr].status === 'all-in'
      ) {
         players[addr].currentBet = 0;
         players[addr].lastAction = null; // ← fixes check stuck bug
      }
   });

   const activePlayers: any[] = Object.values(players)
      .filter((p: any) => p.status === 'active' || p.status === 'all-in')
      .sort((a: any, b: any) => a.seatIndex - b.seatIndex);

   // First active (non all-in) player to act, or null if everyone is all-in
   const firstToAct =
      activePlayers.find((p: any) => p.status === 'active') ?? null;

   // If everyone is all-in, no one needs to act — set currentTurn to null
   // The frontend should detect this and auto-advance or just display the cards
   const currentTurn = firstToAct?.address ?? null;
   const turnDeadline = currentTurn ? Date.now() + 30000 : null;

   switch (state.phase) {
      case 'preflop':
         return {
            phase: 'flop',
            communityCards: deck.slice(0, 3),
            _deck: deck.slice(3),
            currentBet: 0,
            currentTurn,
            turnDeadline,
            players,
            pot,
         };

      case 'flop':
         return {
            phase: 'turn',
            communityCards: [...(state.communityCards ?? []), deck[0]],
            _deck: deck.slice(1),
            currentBet: 0,
            currentTurn,
            turnDeadline,
            players,
            pot,
         };

      case 'turn':
         return {
            phase: 'river',
            communityCards: [...(state.communityCards ?? []), deck[0]],
            _deck: deck.slice(1),
            currentBet: 0,
            currentTurn,
            turnDeadline,
            players,
            pot,
         };

      case 'river':
         return await determineWinners(state, players, pot);

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
   const tournamentRef = db.collection('tournaments').doc(state.tournamentId);

   const eligiblePlayers = Object.values(players).filter(
      (p: any) => p.status === 'active' || p.status === 'all-in',
   );

   // Evaluate all hands
   const results = await Promise.all(
      eligiblePlayers.map(async (player) => {
         const handSnap = await gameRef
            .collection('privateHands')
            .doc(player.address)
            .get();
         const holeCards = handSnap.data()?.holeCards ?? [];
         const handResult = evaluateHand(holeCards, state.communityCards ?? []);
         return { player, holeCards, handResult };
      }),
   );

   results.sort((a, b) => b.handResult.score - a.handResult.score);

   // ✅ Handle split pots
   const bestScore = results[0].handResult.score;
   const winnersList = results.filter((r) => r.handResult.score === bestScore);
   const sharePerWinner = Math.floor(pot / winnersList.length);

   // ✅ Give chips to hand winner(s)
   winnersList.forEach((w) => {
      players[w.player.address].chips += sharePerWinner;
   });

   // ✅ Reset all bets for next hand
   Object.keys(players).forEach((addr) => {
      players[addr].currentBet = 0;
   });

   // ✅ Eliminate players with 0 chips
   Object.keys(players).forEach((addr) => {
      if (players[addr].chips <= 0) {
         players[addr].status = 'eliminated';
      }
   });

   const survivors = Object.values(players).filter(
      (p: any) => p.status !== 'eliminated',
   );

   const revealedHands: Record<string, any> = {};
   results.forEach((r) => {
      revealedHands[r.player.address] = r.holeCards;
   });

   const winnersData = winnersList.map((w) => ({
      address: w.player.address,
      amount: sharePerWinner,
      hand: w.handResult.description,
      isTournamentWinner: survivors.length === 1,
   }));

   console.log(
      `Hand complete. Winners: ${winnersList.length}. Survivors: ${survivors.length}`,
   );

   // ✅ Tournament over — one player left
   if (survivors.length === 1) {
      await tournamentRef.update({
         status: 'completed',
         winner: survivors[0].address,
      });

      return {
         phase: 'finished',
         players,
         pot: 0,
         currentBet: 0,
         currentTurn: null,
         winners: winnersData,
         revealedHands,
         lastUpdated: Date.now(),
      };
   }

   // ✅ More players remain — show showdown then auto-deal next hand
   await gameRef.update({
      phase: 'showdown',
      players,
      pot: 0,
      currentBet: 0,
      currentTurn: null,
      winners: winnersData,
      revealedHands,
      lastUpdated: Date.now(),
   });

   // ✅ Wait 5 seconds so players can see the result, then deal next hand
   await new Promise((resolve) => setTimeout(resolve, 5000));

   await dealNewHand(state.tournamentId, {
      ...state,
      players,
      handNumber: state.handNumber + 1,
   });

   // Return empty since we already updated directly
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
