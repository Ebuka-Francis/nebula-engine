'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tournament } from '../../../../types';
import { motion, Variants } from 'framer-motion';
import {
   ArrowLeft,
   Zap,
   Users,
   Trophy,
   Clock,
   Plus,
   Crown,
   ScrollText,
   Coins,
   Brain,
} from 'lucide-react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

// ── Variants ─────────────────────────────────────────────
const contentVariants: Variants = {
   hidden: { opacity: 0, y: 16 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
   },
};

const rowVariants: Variants = {
   hidden: { opacity: 0, x: -24 },
   visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' },
   }),
};

// ── Tabs ─────────────────────────────────────────────────
const tabs = [
   { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
   { id: 'rules', label: 'Rules', icon: ScrollText },
   { id: 'payouts', label: 'Payouts', icon: Coins },
   { id: 'predictions', label: 'Predictions', icon: Brain },
];

const rules = [
   "Texas Hold'em – No Limit format.",
   'Blind levels increase every 15 minutes.',
   'Starting stack: 10,000 chips per player.',
   'Late registration closes after Level 4.',
   'All-in situations are resolved on-chain via Rain Protocol.',
   'Players disconnecting for 3+ minutes are auto-folded.',
   'Prize payouts are automated — no manual claims needed.',
];

// ── Loading Skeleton ──────────────────────────────────────
function Skeleton() {
   return (
      <div className="min-h-screen bg-[#0d0d0f] px-4 md:px-8 py-10">
         <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-4 w-32 rounded-full bg-white/[0.05] animate-pulse" />
            <div className="h-40 rounded-2xl bg-white/[0.03] animate-pulse" />
            <div className="h-10 rounded-xl bg-white/[0.03] animate-pulse" />
            <div className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />
         </div>
      </div>
   );
}

// ── Status Badge ─────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
   if (status === 'live')
      return (
         <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
         </span>
      );
   if (status === 'ended')
      return (
         <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/30 text-[10px] font-semibold">
            Ended
         </span>
      );
   return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-semibold">
         <Clock size={10} />
         Upcoming
      </span>
   );
}

// ── Main Component ────────────────────────────────────────
export default function TournamentDetailPage() {
   const { id } = useParams();
   const { address, isConnected } = useAccount();
   const [tournament, setTournament] = useState<Tournament | null>(null);
   const [loading, setLoading] = useState(true);
   const [notFound, setNotFound] = useState(false);
   const [activeTab, setActiveTab] = useState('leaderboard');
   const [joining, setJoining] = useState(false);

   const isCreator = tournament?.creatorAddress === address?.toLowerCase();

   // Real-time tournament listener
   useEffect(() => {
      if (!id) return;

      const ref = doc(db, 'tournaments', id as string);
      const unsubscribe = onSnapshot(ref, (snap) => {
         if (!snap.exists()) {
            setNotFound(true);
         } else {
            setTournament({ id: snap.id, ...snap.data() } as Tournament);
         }
         setLoading(false);
      });

      return () => unsubscribe();
   }, [id]);

   const handleJoin = async () => {
      if (!isConnected) {
         alert('Please connect your wallet first.');
         return;
      }
      setJoining(true);
      // TODO: Wire to Rain Protocol escrow + increment currentPlayers
      setTimeout(() => {
         setJoining(false);
         alert('Join tournament flow coming soon!');
      }, 1500);
   };

   // ── States ──
   if (loading) return <Skeleton />;

   if (notFound)
      return (
         <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center gap-4">
            <Trophy size={40} className="text-white/10" />
            <p className="text-white/30 text-sm">Tournament not found.</p>
            <Link
               href="/tournament"
               className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
            >
               ← Back to Tournaments
            </Link>
         </div>
      );

   if (!tournament) return null;

   // Derive payout structure from prize pool
   const payouts = [
      {
         place: '1st Place',
         pct: '50%',
         amount: `${(tournament.prizePool * 0.5).toLocaleString()} USDC`,
      },
      {
         place: '2nd Place',
         pct: '25%',
         amount: `${(tournament.prizePool * 0.25).toLocaleString()} USDC`,
      },
      {
         place: '3rd Place',
         pct: '12.5%',
         amount: `${(tournament.prizePool * 0.125).toLocaleString()} USDC`,
      },
      {
         place: '4th–8th Place',
         pct: '12.5% split',
         amount: `${(tournament.prizePool * 0.125).toLocaleString()} USDC`,
      },
   ];

   return (
      <div className="min-h-screen bg-[#0d0d0f] px-4 md:px-8 py-10 font-sans">
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-700/8 blur-[120px] rounded-full pointer-events-none z-0" />

         <div className="relative z-10 max-w-3xl mx-auto">
            {/* Back */}
            <motion.div
               initial={{ opacity: 0, x: -16 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.4 }}
            >
               <Link
                  href="/tournament"
                  className="inline-flex items-center gap-1.5 text-white/30 text-xs font-medium hover:text-purple-400 transition-colors duration-200 mb-5"
               >
                  <ArrowLeft size={13} />
                  Back to Tournaments
               </Link>
            </motion.div>

            {/* Hero Card */}
            <motion.div
               initial={{ opacity: 0, y: 24 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, ease: 'easeOut' }}
               className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 md:p-6 mb-4"
            >
               <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                  <div>
                     <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                           {tournament.name}
                        </h1>
                        <StatusBadge status={tournament.status} />
                     </div>
                     <p className="text-white/30 text-xs">
                        {tournament.type} &nbsp;•&nbsp; Created by{' '}
                        <span className="text-purple-400/70 font-mono">
                           {tournament.creatorAddress.slice(0, 6)}...
                           {tournament.creatorAddress.slice(-4)}
                        </span>
                        {isCreator && (
                           <span className="ml-2 text-purple-400/50 text-[10px] font-semibold uppercase tracking-wider">
                              (You)
                           </span>
                        )}
                     </p>
                  </div>

                  {/* Join / Creator badge */}
                  {tournament.status !== 'ended' &&
                     (isCreator ? (
                        <span className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-500/30 text-purple-400 text-xs font-semibold shrink-0">
                           <Crown size={13} />
                           Your Tournament
                        </span>
                     ) : (
                        <motion.button
                           onClick={handleJoin}
                           disabled={
                              joining || tournament.status === 'upcoming'
                           }
                           whileHover={{
                              scale: 1.04,
                              boxShadow: '0 0 30px rgba(139,92,246,0.6)',
                           }}
                           whileTap={{ scale: 0.97 }}
                           className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {joining ? (
                              <>
                                 <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                 Joining...
                              </>
                           ) : (
                              <>
                                 <Plus size={15} />
                                 Join Tournament
                              </>
                           )}
                        </motion.button>
                     ))}
               </div>

               {/* Stats */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                     {
                        icon: Zap,
                        label: 'Entry Fee',
                        value: `${tournament.entryFee} USDC`,
                     },
                     {
                        icon: Trophy,
                        label: 'Prize Pool',
                        value: `${tournament.prizePool.toLocaleString()} USDC`,
                     },
                     {
                        icon: Users,
                        label: 'Players',
                        value: `${tournament.currentPlayers} / ${tournament.maxPlayers}`,
                     },
                     {
                        icon: Clock,
                        label: 'Status',
                        value:
                           tournament.status === 'live'
                              ? 'Live Now'
                              : tournament.status === 'ended'
                                ? 'Ended'
                                : 'Upcoming',
                     },
                  ].map((stat) => (
                     <div
                        key={stat.label}
                        className="flex flex-col gap-1 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                     >
                        <div className="flex items-center gap-1.5">
                           <stat.icon size={11} className="text-purple-400" />
                           <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
                              {stat.label}
                           </span>
                        </div>
                        <span className="text-white font-bold text-sm">
                           {stat.value}
                        </span>
                     </div>
                  ))}
               </div>

               {/* Side betting badge */}
               {tournament.sideBetting && (
                  <div className="mt-3 flex items-center gap-1.5 w-fit px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-semibold">
                     <Zap size={10} />
                     Side Betting Enabled
                  </div>
               )}
            </motion.div>

            {/* Tabs */}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.25, duration: 0.4 }}
               className="flex gap-1 mb-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1"
            >
               {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                           isActive
                              ? 'text-white'
                              : 'text-white/30 hover:text-white/60'
                        }`}
                     >
                        {isActive && (
                           <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 rounded-lg bg-purple-600/30 border border-purple-500/30"
                              transition={{
                                 type: 'spring',
                                 stiffness: 400,
                                 damping: 30,
                              }}
                           />
                        )}
                        <Icon size={12} className="relative z-10" />
                        <span className="relative z-10 hidden sm:inline">
                           {tab.label}
                        </span>
                     </button>
                  );
               })}
            </motion.div>

            {/* Tab Content */}
            <motion.div
               key={activeTab}
               variants={contentVariants}
               initial="hidden"
               animate="visible"
               className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden"
            >
               {/* LEADERBOARD */}
               {activeTab === 'leaderboard' && (
                  <div>
                     <div className="grid grid-cols-[40px_1fr_80px_100px] gap-2 px-5 py-3 border-b border-white/[0.05]">
                        {['RANK', 'PLAYER', 'SCORE', 'PRIZE'].map((h) => (
                           <span
                              key={h}
                              className="text-[10px] font-semibold text-white/25 uppercase tracking-widest"
                           >
                              {h}
                           </span>
                        ))}
                     </div>
                     {tournament.currentPlayers === 0 ? (
                        <div className="py-12 text-center text-white/20 text-xs">
                           No players have joined yet.
                        </div>
                     ) : (
                        <div className="py-12 text-center text-white/20 text-xs">
                           Leaderboard updates once the game starts.
                        </div>
                     )}
                  </div>
               )}

               {/* RULES */}
               {activeTab === 'rules' && (
                  <div className="p-5 flex flex-col gap-3">
                     <div className="flex flex-col gap-1 mb-2">
                        <div className="flex justify-between text-xs text-white/30 px-1">
                           <span>Blind Duration</span>
                           <span className="text-white/60 font-medium">
                              {tournament.blindDuration}
                           </span>
                        </div>
                        <div className="flex justify-between text-xs text-white/30 px-1">
                           <span>Starting Stack</span>
                           <span className="text-white/60 font-medium">
                              {tournament.startingStack.toLocaleString()} chips
                           </span>
                        </div>
                        <div className="flex justify-between text-xs text-white/30 px-1">
                           <span>Game Type</span>
                           <span className="text-white/60 font-medium">
                              {tournament.type}
                           </span>
                        </div>
                     </div>
                     <div className="border-t border-white/[0.05] pt-4 flex flex-col gap-3">
                        {rules.map((rule, i) => (
                           <motion.div
                              key={i}
                              custom={i}
                              variants={rowVariants}
                              initial="hidden"
                              animate="visible"
                              className="flex items-start gap-3"
                           >
                              <span className="mt-0.5 w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-[10px] font-black text-purple-400 shrink-0">
                                 {i + 1}
                              </span>
                              <p className="text-white/60 text-sm leading-relaxed">
                                 {rule}
                              </p>
                           </motion.div>
                        ))}
                     </div>
                  </div>
               )}

               {/* PAYOUTS */}
               {activeTab === 'payouts' && (
                  <div>
                     <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b border-white/[0.05]">
                        {['PLACE', 'SHARE', 'AMOUNT'].map((h) => (
                           <span
                              key={h}
                              className="text-[10px] font-semibold text-white/25 uppercase tracking-widest"
                           >
                              {h}
                           </span>
                        ))}
                     </div>
                     {tournament.payoutStructure?.map((pct, i) => (
                        <motion.div
                           key={i}
                           custom={i}
                           variants={rowVariants}
                           initial="hidden"
                           animate="visible"
                           className={`grid grid-cols-3 gap-2 items-center px-5 py-3.5 border-b border-white/[0.03] last:border-0 ${i === 0 ? 'bg-yellow-400/[0.03]' : ''}`}
                        >
                           <span
                              className={`text-sm font-semibold ${
                                 i === 0
                                    ? 'text-yellow-400'
                                    : i === 1
                                      ? 'text-slate-300'
                                      : i === 2
                                        ? 'text-orange-400'
                                        : 'text-white/50'
                              }`}
                           >
                              {i === 0
                                 ? '🥇 1st'
                                 : i === 1
                                   ? '🥈 2nd'
                                   : i === 2
                                     ? '🥉 3rd'
                                     : `${i + 1}th`}{' '}
                              Place
                           </span>
                           <span className="text-white/40 text-sm">{pct}%</span>
                           <span
                              className={`text-sm font-bold ${i === 0 ? 'text-yellow-400' : 'text-purple-400'}`}
                           >
                              {(
                                 (tournament.prizePool * pct) /
                                 100
                              ).toLocaleString()}{' '}
                              USDC
                           </span>
                        </motion.div>
                     ))}
                     <p className="text-[10px] text-white/20 px-5 py-3">
                        Payouts are automated via Rain Protocol escrow.
                     </p>
                  </div>
               )}

               {/* PREDICTIONS */}
               {/* PREDICTIONS */}
               {activeTab === 'predictions' && (
                  <div className="p-5">
                     {!tournament.sideBetting ? (
                        <div className="text-center py-8 text-white/20 text-xs">
                           Side betting is not enabled for this tournament.
                        </div>
                     ) : (
                        <div className="flex flex-col gap-4">
                           {/* Header */}
                           <div className="flex items-center justify-between">
                              <div>
                                 <h3 className="text-white font-bold text-sm">
                                    Place Your Predictions
                                 </h3>
                                 <p className="text-white/30 text-xs mt-0.5">
                                    Predict who finishes 1st, 2nd or 3rd before
                                    the tournament ends.
                                 </p>
                              </div>
                              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-semibold">
                                 <Zap size={10} />
                                 Open
                              </span>
                           </div>

                           {/* Prediction Markets */}
                           {tournament.currentPlayers === 0 ? (
                              <div className="text-center py-8 text-white/20 text-xs">
                                 No players have joined yet. Predictions open
                                 once players join.
                              </div>
                           ) : (
                              <div className="flex flex-col gap-3">
                                 {[
                                    {
                                       label: '🥇 1st Place Winner',
                                       multiplier: '2.1x',
                                       color: 'text-yellow-400',
                                       border: 'border-yellow-400/20',
                                       bg: 'bg-yellow-400/5',
                                    },
                                    {
                                       label: '🥈 2nd Place',
                                       multiplier: '3.4x',
                                       color: 'text-slate-300',
                                       border: 'border-slate-400/20',
                                       bg: 'bg-slate-400/5',
                                    },
                                    {
                                       label: '🥉 3rd Place',
                                       multiplier: '5.0x',
                                       color: 'text-orange-400',
                                       border: 'border-orange-400/20',
                                       bg: 'bg-orange-400/5',
                                    },
                                    {
                                       label: '⚔️ First Elimination',
                                       multiplier: '1.8x',
                                       color: 'text-red-400',
                                       border: 'border-red-400/20',
                                       bg: 'bg-red-400/5',
                                    },
                                 ].map((market, i) => (
                                    <motion.div
                                       key={market.label}
                                       custom={i}
                                       variants={rowVariants}
                                       initial="hidden"
                                       animate="visible"
                                       className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${market.border} ${market.bg}`}
                                    >
                                       <div className="flex flex-col gap-1">
                                          <span className="text-white text-sm font-semibold">
                                             {market.label}
                                          </span>
                                          <div className="flex items-center gap-2">
                                             <span className="text-white/30 text-[10px]">
                                                Multiplier:
                                             </span>
                                             <span
                                                className={`text-sm font-black ${market.color}`}
                                             >
                                                {market.multiplier}
                                             </span>
                                          </div>
                                       </div>

                                       {/* Bet input + button */}
                                       <div className="flex items-center gap-2 shrink-0">
                                          <input
                                             type="number"
                                             placeholder="USDC"
                                             min="1"
                                             className="w-20 bg-black/30 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all duration-200"
                                          />
                                          <motion.button
                                             whileHover={{ scale: 1.04 }}
                                             whileTap={{ scale: 0.97 }}
                                             onClick={() => {
                                                if (!isConnected) {
                                                   alert(
                                                      'Please connect your wallet to place a bet.',
                                                   );
                                                   return;
                                                }
                                                // TODO: Wire to Rain Protocol prediction market
                                                alert(
                                                   'Prediction betting coming soon via Rain Protocol!',
                                                );
                                             }}
                                             className="px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors duration-200 cursor-pointer whitespace-nowrap"
                                          >
                                             Place Bet
                                          </motion.button>
                                       </div>
                                    </motion.div>
                                 ))}

                                 {/* Info note */}
                                 <p className="text-[10px] text-white/20 text-center mt-1">
                                    Predictions powered by Rain Protocol.
                                    Payouts are automatic.
                                 </p>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               )}
            </motion.div>
         </div>
      </div>
   );
}
