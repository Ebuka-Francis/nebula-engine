'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { GameState } from '../../../types';
import { useAccount } from 'wagmi';
import ActionPanel from './ActionPanel';
import PlayerHUD from './PlayerHUD';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoFold } from '@/hooks/useAutoFold';
import { Loader } from 'lucide-react';

interface Props {
   tournamentId: string;
}

// ── Card UI ───────────────────────────────────────────────
function CardUI({ card, revealed }: { card: any; revealed: boolean }) {
   const suitSymbol: Record<string, string> = {
      spades: '♠',
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
   };
   const suitColor: Record<string, string> = {
      spades: 'text-slate-800',
      hearts: 'text-red-500',
      diamonds: 'text-red-500',
      clubs: 'text-slate-800',
   };

   return (
      <motion.div
         initial={{ rotateY: 180, opacity: 0 }}
         animate={{ rotateY: 0, opacity: 1 }}
         transition={{ duration: 0.4 }}
         className={`w-12 h-16 rounded-lg border flex items-center justify-center font-black text-sm shadow-lg ${
            revealed && card
               ? 'bg-white border-white/20'
               : 'bg-[#1a1a2e] border-purple-500/20'
         }`}
      >
         {revealed && card ? (
            <div
               className={`flex flex-col items-center leading-none ${suitColor[card.suit]}`}
            >
               <span className="text-xs font-black">{card.rank}</span>
               <span className="text-base">{suitSymbol[card.suit]}</span>
            </div>
         ) : (
            <span className="text-purple-400/40 text-lg">🂠</span>
         )}
      </motion.div>
   );
}

// ── Pre-Game Countdown Overlay ────────────────────────────
function PreGameCountdown({ startTime }: { startTime: any }) {
   const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

   useEffect(() => {
      if (!startTime) return;
      const start = startTime.toDate?.() ?? new Date(startTime);

      const tick = () => {
         const diff = Math.ceil((start.getTime() - Date.now()) / 1000);
         setSecondsLeft(Math.max(0, diff));
      };

      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
   }, [startTime]);

   if (secondsLeft === null || secondsLeft <= 0) return null;

   const minutes = Math.floor(secondsLeft / 60);
   const seconds = secondsLeft % 60;

   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/70 backdrop-blur-sm"
      >
         <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-6 text-center px-6"
         >
            <div className="relative">
               <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-32 h-32 rounded-full border-4 border-purple-500/30 absolute inset-0"
               />
               <div className="w-32 h-32 rounded-full border-4 border-purple-500 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.5)]">
                  <span className="text-white font-black text-3xl tabular-nums">
                     {String(minutes).padStart(2, '0')}:
                     {String(seconds).padStart(2, '0')}
                  </span>
               </div>
            </div>
            <div>
               <p className="text-white font-black text-2xl mb-1">
                  Game Starting Soon
               </p>
               <p className="text-white/40 text-sm">
                  The tournament begins in{' '}
                  {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`}
               </p>
            </div>
         </motion.div>
      </motion.div>
   );
}

// ── Waiting for Players Overlay ───────────────────────────
function WaitingOverlay({
   playerCount,
   isHost,
   onStart,
   loading,
}: {
   playerCount: number;
   isHost: boolean;
   onStart: () => void;
   loading: boolean;
}) {
   return (
      <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-sm"
      >
         <div className="flex flex-col items-center gap-4 text-center px-6">
            <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
               className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent"
            />
            <p className="text-white font-black text-xl">
               {playerCount} Player{playerCount !== 1 ? 's' : ''} at the Table
            </p>
            {isHost ? (
               <div className="flex flex-col items-center gap-4">
                  <p className="text-yellow-400 text-sm font-semibold">
                     👑 You are the host
                  </p>
                  {playerCount < 2 ? (
                     <p className="text-white/40 text-xs max-w-xs">
                        Waiting for at least 2 players to join...
                     </p>
                  ) : (
                     <button
                        onClick={onStart}
                        className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all transform hover:scale-105"
                     >
                        {loading ? (
                           <Loader className="animate-spin w-5 h-5" />
                        ) : (
                           'START GAME NOW'
                        )}
                     </button>
                  )}
               </div>
            ) : (
               <p className="text-white/40 text-xs">
                  Waiting for the host to start the game...
               </p>
            )}
         </div>
      </motion.div>
   );
}

// ── Showdown Overlay ──────────────────────────────────────
function ShowdownOverlay({ winners }: { winners: any[] }) {
   return (
      <AnimatePresence>
         <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
         >
            <div className="bg-black/90 backdrop-blur-md border border-yellow-400/40 rounded-3xl px-10 py-8 text-center shadow-[0_0_60px_rgba(250,204,21,0.3)]">
               <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-5xl mb-3"
               >
                  🏆
               </motion.div>
               <p className="text-yellow-400 font-black text-2xl mb-4">
                  Winner!
               </p>
               {winners.map((w) => (
                  <div
                     key={w.address}
                     className="flex flex-col items-center gap-1"
                  >
                     <p className="text-white font-mono text-sm opacity-70">
                        {w.address.slice(0, 6)}...{w.address.slice(-4)}
                     </p>
                     <p className="text-yellow-300 font-bold text-sm">
                        {w.hand}
                     </p>
                     <p className="text-emerald-400 font-black text-2xl mt-1">
                        +{w.amount.toLocaleString()} USDC
                     </p>
                  </div>
               ))}
            </div>
         </motion.div>
      </AnimatePresence>
   );
}

// ── Main Poker Table ──────────────────────────────────────
export default function PokerTable({ tournamentId }: Props) {
   const mountRef = useRef<HTMLDivElement>(null);
   const animFrameRef = useRef<number>(0);
   const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

   const firebaseFunctions = getFunctions();
   const startGameFn = httpsCallable(firebaseFunctions, 'startGameManually');
   const { address } = useAccount();

   const [gameState, setGameState] = useState<GameState | null>(null);
   const [myHand, setMyHand] = useState<any[]>([]);
   const [isMyTurn, setIsMyTurn] = useState(false);
   const [tournament, setTournament] = useState<any>(null);
   const [loading, setLoading] = useState(false);

   const handleGameAction = useCallback(
      async (type: string, amount: number = 0) => {
         try {
            const playerActionFn = httpsCallable(
               firebaseFunctions,
               'playerAction',
            );
            await playerActionFn({
               tournamentId,
               action: type,
               amount,
               playerAddress: address?.toLowerCase() ?? '', // ← add this
            });
         } catch (error: any) {
            console.error('Action failed:', error.message);
         }
      },
      [tournamentId, address],
   );

   const handleAutoFold = useCallback(async () => {
      await handleGameAction('fold', 0);
   }, [handleGameAction]);

   useAutoFold(
      tournamentId,
      isMyTurn,
      gameState?.turnDeadline ?? null,
      address?.toLowerCase() ?? '',
      handleAutoFold,
   );

   const isHost = tournament?.creatorAddress === address?.toLowerCase();

   const handleHostStartNow = async (tid: string) => {
      try {
         setLoading(true);

         // 2. Use the initialized 'startGameFn' instead of the raw function name
         const result = await startGameFn({ tournamentId: tid });

         console.log('Game started successfully:', result.data);
      } catch (error: any) {
         // This will now catch the specific Firebase error
         console.error('Error starting game:', error.message);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (!tournamentId) return;
      const unsub = onSnapshot(doc(db, 'tournaments', tournamentId), (snap) => {
         if (snap.exists()) setTournament(snap.data());
      });
      return () => unsub();
   }, [tournamentId]);

   useEffect(() => {
      if (!tournamentId) return;
      const unsubGame = onSnapshot(
         doc(db, 'gameState', tournamentId),
         (snap) => {
            if (snap.exists()) {
               const state = snap.data() as GameState;
               setGameState(state);
               setIsMyTurn(
                  !!state.currentTurn &&
                     !!address &&
                     state.currentTurn.toLowerCase() === address.toLowerCase(),
               );
            }
         },
      );

      const unsubHand = address
         ? onSnapshot(
              doc(
                 db,
                 'gameState',
                 tournamentId,
                 'privateHands',
                 address.toLowerCase(),
              ),
              (snap) => {
                 if (snap.exists()) setMyHand(snap.data()?.holeCards || []);
              },
           )
         : () => {};

      return () => {
         unsubGame();
         unsubHand();
      };
   }, [tournamentId, address]);

   useEffect(() => {
      if (!mountRef.current) return;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#0d0d0f');
      const camera = new THREE.PerspectiveCamera(
         50,
         mountRef.current.clientWidth / mountRef.current.clientHeight,
         0.1,
         1000,
      );
      camera.position.set(0, 8, 6);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(
         mountRef.current.clientWidth,
         mountRef.current.clientHeight,
      );
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      scene.add(new THREE.AmbientLight(0x9333ea, 0.4));
      const tableGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.15, 64);
      tableGeo.scale(1, 1, 0.65);
      const table = new THREE.Mesh(
         tableGeo,
         new THREE.MeshStandardMaterial({ color: 0x1a5c2a, roughness: 0.9 }),
      );
      scene.add(table);

      const animate = () => {
         animFrameRef.current = requestAnimationFrame(animate);
         renderer.render(scene, camera);
      };
      animate();

      return () => {
         cancelAnimationFrame(animFrameRef.current);
         renderer.dispose();
      };
   }, []);

   useEffect(() => {
      // Only auto-start next hand if the hand ended but someone hasn't won the whole tourney yet
      if (gameState?.phase === 'showdown' && isHost) {
         const timer = setTimeout(() => {
            handleHostStartNow(tournamentId);
         }, 7000);

         return () => clearTimeout(timer);
      }
   }, [gameState?.phase, isHost]);

   // ── Render Logic ──
   const showPreGame =
      tournament?.startTime &&
      tournament.startTime.toDate?.().getTime() > Date.now() &&
      (!gameState || gameState.phase === 'waiting');
   const showWaiting =
      !showPreGame && (!gameState || gameState.phase === 'waiting');

   return (
      <div className="relative w-full h-screen bg-[#0d0d0f] overflow-hidden">
         <div ref={mountRef} className="absolute inset-0" />

         {showPreGame && tournament?.startTime && (
            <PreGameCountdown startTime={tournament.startTime} />
         )}

         {showWaiting && (
            <WaitingOverlay
               playerCount={tournament?.currentPlayers ?? 0}
               loading={loading}
               isHost={isHost}
               onStart={() => handleHostStartNow(tournamentId)}
            />
         )}

         {gameState && gameState.phase !== 'waiting' && (
            <>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 pointer-events-none">
                  {gameState.communityCards.map((card, i) => (
                     <CardUI key={i} card={card} revealed />
                  ))}
                  {Array.from({
                     length: 5 - gameState.communityCards.length,
                  }).map((_, i) => (
                     <CardUI key={`ph-${i}`} card={null} revealed={false} />
                  ))}
               </div>

               <div className="absolute top-[42%] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                  <span className="text-yellow-400 font-black text-lg">
                     {gameState.pot.toLocaleString()} USDC
                  </span>
                  <span className="text-white/30 text-[10px] uppercase tracking-widest">
                     Pot
                  </span>
               </div>

               <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold uppercase tracking-widest">
                     {gameState.phase}
                  </span>
               </div>

               {Object.values(gameState.players).map(
                  (player, absoluteIndex) => {
                     const allPlayers = Object.values(gameState.players);
                     const myIndex = allPlayers.findIndex(
                        (p) =>
                           p.address.toLowerCase() === address?.toLowerCase(),
                     );
                     const relativeSeat =
                        myIndex === -1
                           ? absoluteIndex
                           : (absoluteIndex - myIndex + allPlayers.length) %
                             allPlayers.length;

                     return (
                        <PlayerHUD
                           key={player.address}
                           player={player}
                           seatIndex={relativeSeat}
                           isCurrentTurn={
                              gameState.currentTurn?.toLowerCase() ===
                              player.address.toLowerCase()
                           }
                           isMe={
                              player.address.toLowerCase() ===
                              address?.toLowerCase()
                           }
                           turnDeadline={gameState.turnDeadline}
                        />
                     );
                  },
               )}

               {myHand.length > 0 && (
                  <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-3">
                     {myHand.map((card, i) => (
                        <CardUI key={i} card={card} revealed />
                     ))}
                  </div>
               )}

               {gameState.winners &&
                  gameState.winners.length > 0 &&
                  gameState.winners[0].amount > 0 && (
                     <ShowdownOverlay winners={gameState.winners} />
                  )}
            </>
         )}

         {isMyTurn && gameState && gameState.phase !== 'waiting' && (
            <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-auto">
               <ActionPanel
                  tournamentId={tournamentId}
                  gameState={gameState}
                  playerAddress={address?.toLowerCase() ?? ''}
                  onAction={handleGameAction}
               />
            </div>
         )}
      </div>
   );
}
