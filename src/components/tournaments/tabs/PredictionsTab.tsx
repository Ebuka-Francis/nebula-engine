'use client';

import { useEffect, useState } from 'react';
import {
   collection,
   onSnapshot,
   query,
   orderBy,
   addDoc,
   serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
   Zap,
   ChevronDown,
   CheckCircle2,
   Loader2,
   Trophy,
   Lock,
} from 'lucide-react';
import { Tournament } from '../../../../types';
import { useAccount } from 'wagmi';

interface Registration {
   address: string;
   username: string;
   score?: number;
}

interface Market {
   id: string;
   label: string;
   emoji: string;
   multiplier: number;
   color: string;
   border: string;
   bg: string;
   glowColor: string;
   description: string;
}

const MARKETS: Market[] = [
   {
      id: 'first',
      label: '1st Place Winner',
      emoji: '🥇',
      multiplier: 2.1,
      color: 'text-yellow-400',
      border: 'border-yellow-400/20',
      bg: 'bg-yellow-400/[0.04]',
      glowColor: 'rgba(250,204,21,0.15)',
      description: 'Who will finish in 1st place?',
   },
   {
      id: 'second',
      label: '2nd Place',
      emoji: '🥈',
      multiplier: 3.4,
      color: 'text-slate-300',
      border: 'border-slate-400/20',
      bg: 'bg-slate-400/[0.04]',
      glowColor: 'rgba(148,163,184,0.12)',
      description: 'Who will finish in 2nd place?',
   },
   {
      id: 'third',
      label: '3rd Place',
      emoji: '🥉',
      multiplier: 5.0,
      color: 'text-amber-600',
      border: 'border-amber-600/20',
      bg: 'bg-amber-600/[0.04]',
      glowColor: 'rgba(217,119,6,0.12)',
      description: 'Who will finish in 3rd place?',
   },
   {
      id: 'eliminated_first',
      label: 'First Elimination',
      emoji: '⚔️',
      multiplier: 1.8,
      color: 'text-red-400',
      border: 'border-red-400/20',
      bg: 'bg-red-400/[0.04]',
      glowColor: 'rgba(248,113,113,0.12)',
      description: 'Who gets eliminated first?',
   },
];

const rowVariants: Variants = {
   hidden: { opacity: 0, y: 16 },
   visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' },
   }),
};

// Per-market bet state
interface BetState {
   selectedPlayer: string;
   amount: string;
   submitting: boolean;
   submitted: boolean;
   error: string;
}

function defaultBet(): BetState {
   return {
      selectedPlayer: '',
      amount: '',
      submitting: false,
      submitted: false,
      error: '',
   };
}

function PlayerDropdown({
   players,
   value,
   onChange,
   disabled,
}: {
   players: Registration[];
   value: string;
   onChange: (v: string) => void;
   disabled?: boolean;
}) {
   const [open, setOpen] = useState(false);
   const selected = players.find((p) => p.address === value);

   return (
      <div className="relative">
         <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-black/30 border border-white/[0.08] text-xs text-white/80 hover:border-white/20 focus:outline-none focus:border-purple-500/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
         >
            <span className={selected ? 'text-white' : 'text-white/25'}>
               {selected ? selected.username : 'Select a player…'}
            </span>
            <ChevronDown
               size={12}
               className={`text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
         </button>

         <AnimatePresence>
            {open && (
               <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="relative z-50 top-full mt-1.5 left-0 right-0 rounded-xl border border-white/[0.08] bg-[#121214] shadow-2xl overflow-hidden"
               >
                  {players.map((p) => (
                     <button
                        key={p.address}
                        type="button"
                        onClick={() => {
                           onChange(p.address);
                           setOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-white/[0.05] transition-colors text-left ${
                           value === p.address
                              ? 'text-purple-300 bg-purple-500/10'
                              : 'text-white/70'
                        }`}
                     >
                        <span className="font-semibold">{p.username}</span>
                        <span className="text-white/20 font-mono text-[10px]">
                           {p.address.slice(0, 6)}…{p.address.slice(-4)}
                        </span>
                     </button>
                  ))}
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
}

export default function PredictionsTab({
   tournament,
}: {
   tournament: Tournament;
}) {
   const { address, isConnected } = useAccount();
   const [players, setPlayers] = useState<Registration[]>([]);
   const [loadingPlayers, setLoadingPlayers] = useState(true);
   const [bets, setBets] = useState<Record<string, BetState>>(() =>
      Object.fromEntries(MARKETS.map((m) => [m.id, defaultBet()])),
   );

   // Real-time players
   useEffect(() => {
      if (!tournament?.id) return;
      const ref = collection(db, 'tournaments', tournament.id, 'registrations');
      const q = query(ref, orderBy('joinedAt', 'asc'));
      const unsub = onSnapshot(q, (snap) => {
         setPlayers(
            snap.docs.map((d) => ({
               address: d.id,
               ...d.data(),
            })) as Registration[],
         );
         setLoadingPlayers(false);
      });
      return () => unsub();
   }, [tournament?.id]);

   const patchBet = (marketId: string, patch: Partial<BetState>) =>
      setBets((prev) => ({
         ...prev,
         [marketId]: { ...prev[marketId], ...patch },
      }));

   const handlePlaceBet = async (market: Market) => {
      const bet = bets[market.id];

      if (!isConnected || !address) {
         patchBet(market.id, { error: 'Connect your wallet first.' });
         return;
      }
      if (!bet.selectedPlayer) {
         patchBet(market.id, { error: 'Please select a player.' });
         return;
      }
      if (!bet.amount || parseFloat(bet.amount) <= 0) {
         patchBet(market.id, { error: 'Enter a valid amount.' });
         return;
      }

      patchBet(market.id, { submitting: true, error: '' });

      try {
         const selectedPlayer = players.find(
            (p) => p.address === bet.selectedPlayer,
         );

         await addDoc(
            collection(db, 'tournaments', tournament.id, 'predictions'),
            {
               marketId: market.id,
               marketLabel: market.label,
               bettorAddress: address.toLowerCase(),
               playerAddress: bet.selectedPlayer,
               playerUsername: selectedPlayer?.username ?? '',
               amount: parseFloat(bet.amount),
               multiplier: market.multiplier,
               potentialPayout: parseFloat(bet.amount) * market.multiplier,
               status: 'pending',
               placedAt: serverTimestamp(),
            },
         );

         patchBet(market.id, { submitted: true, submitting: false });
      } catch (err: any) {
         patchBet(market.id, {
            error: err.message ?? 'Failed to place prediction.',
            submitting: false,
         });
      }
   };

   // Disabled if tournament has ended
   const isClosed = tournament.status === 'ended';

   if (!tournament.sideBetting) {
      return (
         <div className="flex flex-col items-center gap-3 py-14 text-center">
            <Lock size={28} className="text-white/10" />
            <p className="text-white/20 text-xs">
               Side betting is not enabled for this tournament.
            </p>
         </div>
      );
   }

   return (
      <div className="p-5 flex flex-col gap-5">
         {/* Header */}
         <div className="flex items-start justify-between gap-4">
            <div>
               <h3 className="text-white font-bold text-sm">
                  Place Your Predictions
               </h3>
               <p className="text-white/30 text-xs mt-0.5">
                  Pick a player for each market before or during the tournament.
               </p>
            </div>
            <span
               className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 ${
                  isClosed
                     ? 'bg-white/5 border border-white/10 text-white/30'
                     : 'bg-pink-500/10 border border-pink-500/20 text-pink-400'
               }`}
            >
               <Zap size={10} />
               {isClosed ? 'Closed' : 'Open'}
            </span>
         </div>

         {/* Empty / loading players */}
         {loadingPlayers ? (
            <div className="flex flex-col gap-3">
               {MARKETS.map((m) => (
                  <div
                     key={m.id}
                     className="h-24 rounded-xl bg-white/[0.03] animate-pulse"
                  />
               ))}
            </div>
         ) : players.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
               <Trophy size={28} className="text-white/10" />
               <p className="text-white/20 text-xs">
                  No players have joined yet.
                  <br />
                  Predictions open once players register.
               </p>
            </div>
         ) : (
            <div className="flex flex-col gap-3">
               {MARKETS.map((market, i) => {
                  const bet = bets[market.id];

                  return (
                     <motion.div
                        key={market.id}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className={`rounded-xl border ${market.border} ${market.bg} overflow-hidden`}
                     >
                        <div className="p-4 flex flex-col gap-3">
                           {/* Market header */}
                           <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-white text-sm font-bold flex items-center gap-1.5">
                                    <span>{market.emoji}</span>
                                    {market.label}
                                 </span>
                                 <span className="text-white/30 text-[10px]">
                                    {market.description}
                                 </span>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                 <span className="text-[10px] text-white/25 uppercase tracking-wider">
                                    Multiplier
                                 </span>
                                 <span
                                    className={`text-lg font-black ${market.color}`}
                                 >
                                    {market.multiplier}x
                                 </span>
                              </div>
                           </div>

                           {/* Submitted state */}
                           {bet.submitted ? (
                              <motion.div
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                              >
                                 <CheckCircle2
                                    size={14}
                                    className="text-emerald-400 shrink-0"
                                 />
                                 <div className="flex flex-col">
                                    <span className="text-emerald-400 text-xs font-semibold">
                                       Prediction placed!
                                    </span>
                                    <span className="text-white/30 text-[10px]">
                                       {bet.amount} USDC on{' '}
                                       {players.find(
                                          (p) =>
                                             p.address === bet.selectedPlayer,
                                       )?.username ?? '—'}{' '}
                                       · Potential:{' '}
                                       {(
                                          parseFloat(bet.amount) *
                                          market.multiplier
                                       ).toFixed(2)}{' '}
                                       USDC
                                    </span>
                                 </div>
                              </motion.div>
                           ) : (
                              <>
                                 {/* Inputs */}
                                 <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                       <PlayerDropdown
                                          players={players}
                                          value={bet.selectedPlayer}
                                          onChange={(v) =>
                                             patchBet(market.id, {
                                                selectedPlayer: v,
                                                error: '',
                                             })
                                          }
                                          disabled={isClosed}
                                       />
                                    </div>
                                    <input
                                       type="number"
                                       placeholder="USDC"
                                       min="1"
                                       disabled={isClosed}
                                       value={bet.amount}
                                       onChange={(e) =>
                                          patchBet(market.id, {
                                             amount: e.target.value,
                                             error: '',
                                          })
                                       }
                                       className="w-20 h-[30px] bg-black/30 border border-white/[0.08] rounded-lg px-2.5 py-2 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                    />
                                    <motion.button
                                       whileHover={{ scale: 1.04 }}
                                       whileTap={{ scale: 0.97 }}
                                       onClick={() => handlePlaceBet(market)}
                                       disabled={bet.submitting || isClosed}
                                       className="h-[30px] px-3 py-2 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors duration-200 cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                                    >
                                       {bet.submitting ? (
                                          <>
                                             <Loader2
                                                size={11}
                                                className="animate-spin"
                                             />
                                             Placing…
                                          </>
                                       ) : (
                                          'Place Bet'
                                       )}
                                    </motion.button>
                                 </div>

                                 {/* Potential payout preview */}
                                 {bet.amount && parseFloat(bet.amount) > 0 && (
                                    <motion.p
                                       initial={{ opacity: 0, y: -4 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       className="text-[10px] text-white/30"
                                    >
                                       Potential payout:{' '}
                                       <span
                                          className={`font-bold ${market.color}`}
                                       >
                                          {(
                                             parseFloat(bet.amount) *
                                             market.multiplier
                                          ).toFixed(2)}{' '}
                                          USDC
                                       </span>
                                    </motion.p>
                                 )}

                                 {/* Error */}
                                 {bet.error && (
                                    <motion.p
                                       initial={{ opacity: 0, y: -4 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       className="text-red-400 text-[10px]"
                                    >
                                       {bet.error}
                                    </motion.p>
                                 )}
                              </>
                           )}
                        </div>
                     </motion.div>
                  );
               })}

               <p className="text-[10px] text-white/20 text-center mt-1">
                  Predictions powered by Rain Protocol. Payouts are automatic.
               </p>
            </div>
         )}
      </div>
   );
}
