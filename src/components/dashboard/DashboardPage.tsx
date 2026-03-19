'use client';

import { motion, Variants } from 'framer-motion';
import {
   Trophy,
   Coins,
   Users,
   TrendingUp,
   ArrowRight,
   Plus,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getPlayerStats } from '@/lib/playerService';
import { subscribeToPayouts } from '@/lib/payoutService';
import { subscribeToTournaments } from '@/lib/tournamentService';
import { Player, Payout, Tournament } from '../../../types';

// ── Variants ────────────────────────────────────────────
const statVariants: Variants = {
   hidden: { opacity: 0, y: 28 },
   visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.09, ease: 'easeOut' },
   }),
};

const panelVariants: Variants = {
   hidden: { opacity: 0, y: 32 },
   visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.35 + i * 0.1, ease: 'easeOut' },
   }),
};

const rowVariants: Variants = {
   hidden: { opacity: 0, x: -20 },
   visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' },
   }),
};

const payoutRowVariants: Variants = {
   hidden: { opacity: 0, x: 20 },
   visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' },
   }),
};

// ── Helper: format Firestore timestamp to relative time ──
function timeAgo(timestamp: any): string {
   if (!timestamp) return '';
   const date = timestamp.toDate?.() ?? new Date(timestamp);
   const diff = Math.floor((Date.now() - date.getTime()) / 1000);
   if (diff < 60) return `${diff}s ago`;
   if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
   if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
   return `${Math.floor(diff / 86400)}d ago`;
}

// ── Empty state component ────────────────────────────────
function EmptyState({ message }: { message: string }) {
   return (
      <div className="flex items-center justify-center py-8">
         <p className="text-white/20 text-xs">{message}</p>
      </div>
   );
}

// ── Main Component ───────────────────────────────────────
export default function DashboardPage() {
   const { address, isConnected } = useAccount();
   const [player, setPlayer] = useState<Player | null>(null);
   const [payouts, setPayouts] = useState<Payout[]>([]);
   const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
   const [loading, setLoading] = useState(true);

   // Fetch player stats
   useEffect(() => {
      if (!address) return;
      getPlayerStats(address).then((data) => {
         setPlayer(data);
         setLoading(false);
      });
   }, [address]);

   // Real-time payouts
   useEffect(() => {
      if (!address) return;
      const unsubscribe = subscribeToPayouts(address, setPayouts);
      return () => unsubscribe();
   }, [address]);

   // Real-time my tournaments
   useEffect(() => {
      if (!address) return;
      const unsubscribe = subscribeToTournaments((all) => {
         setMyTournaments(all.filter((t) => t.creatorAddress === address));
      });
      return () => unsubscribe();
   }, [address]);

   // Dynamic stats from live player data
   const stats = [
      {
         icon: Trophy,
         label: 'Tournaments Won',
         value: loading ? '—' : String(player?.tournamentsWon ?? 0),
         color: 'text-cyan-400',
         bg: 'bg-cyan-400/10 border-cyan-400/20',
      },
      {
         icon: Coins,
         label: 'Total Earnings',
         value: loading
            ? '—'
            : `${player?.totalEarnings?.toLocaleString() ?? 0} USDC`,
         color: 'text-purple-400',
         bg: 'bg-purple-400/10 border-purple-400/20',
      },
      {
         icon: Users,
         label: 'Tournaments Played',
         value: loading ? '—' : String(player?.tournamentsPlayed ?? 0),
         color: 'text-blue-400',
         bg: 'bg-blue-400/10 border-blue-400/20',
      },
      {
         icon: TrendingUp,
         label: 'Win Rate',
         value: loading ? '—' : `${player?.winRate ?? 0}%`,
         color: 'text-emerald-400',
         bg: 'bg-emerald-400/10 border-emerald-400/20',
      },
   ];

   return (
      <div className="min-h-screen bg-[#0d0d0f] px-4 md:px-8 py-10 font-sans">
         {/* Bg glow */}
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-700/8 blur-[120px] rounded-full pointer-events-none z-0" />

         <div className="relative z-10 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.45, ease: 'easeOut' }}
               className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10"
            >
               <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
                     Dashboard
                  </h1>
                  {isConnected ? (
                     <p className="text-[#6b6b80] text-sm">
                        Welcome back,{' '}
                        <span className="text-purple-400/80 font-mono">
                           {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                     </p>
                  ) : (
                     <p className="text-[#6b6b80] text-sm">
                        Please connect your wallet to view your dashboard.
                     </p>
                  )}
               </div>

               <Link href="/tournament/create">
                  <motion.button
                     whileHover={{
                        scale: 1.04,
                        boxShadow: '0 0 30px rgba(139,92,246,0.6)',
                     }}
                     whileTap={{ scale: 0.97 }}
                     className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] shrink-0 cursor-pointer"
                  >
                     <Plus size={16} />
                     Create Tournament
                  </motion.button>
               </Link>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
               {stats.map((stat, i) => (
                  <motion.div
                     key={stat.label}
                     custom={i}
                     variants={statVariants}
                     initial="hidden"
                     animate="visible"
                     whileHover={{ y: -4, transition: { duration: 0.2 } }}
                     className="group relative flex flex-col gap-4 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] hover:border-purple-500/30 transition-colors duration-300 overflow-hidden cursor-default"
                  >
                     <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.07),transparent_60%)] pointer-events-none" />
                     <div
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center ${stat.bg}`}
                     >
                        <stat.icon size={15} className={stat.color} />
                     </div>
                     <div>
                        <div className="text-2xl md:text-3xl font-black text-white tracking-tight mb-0.5">
                           {stat.value}
                        </div>
                        <div className="text-[11px] text-white/35 font-medium uppercase tracking-wider">
                           {stat.label}
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>

            {/* Bottom Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               {/* My Tournaments */}
               <motion.div
                  custom={0}
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden"
               >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                     <h2 className="text-white font-bold text-sm tracking-tight">
                        My Tournaments
                     </h2>
                     <Link
                        href="/tournament"
                        className="text-purple-400 text-xs font-semibold hover:text-purple-300 transition-colors duration-200"
                     >
                        View all
                     </Link>
                  </div>

                  <div className="p-3 flex flex-col gap-1">
                     {myTournaments.length === 0 ? (
                        <EmptyState message="No tournaments created yet." />
                     ) : (
                        myTournaments.slice(0, 5).map((t, i) => (
                           <Link href={`/tournament/${t.id}`} key={t.id}>
                              <motion.div
                                 custom={i}
                                 variants={rowVariants}
                                 initial="hidden"
                                 animate="visible"
                                 whileHover={{
                                    x: 4,
                                    transition: { duration: 0.2 },
                                 }}
                                 className="group flex items-center justify-between gap-3 px-3 py-3.5 rounded-xl hover:bg-white/[0.03] transition-colors duration-200 cursor-pointer"
                              >
                                 <div>
                                    <p className="text-white text-sm font-semibold mb-0.5">
                                       {t.name}
                                    </p>
                                    <p className="text-white/30 text-xs">
                                       {t.currentPlayers}/{t.maxPlayers} players
                                       • {t.prizePool.toLocaleString()} USDC
                                    </p>
                                 </div>
                                 <div className="flex items-center gap-2 shrink-0">
                                    {t.status === 'live' && (
                                       <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
                                    )}
                                    <ArrowRight
                                       size={15}
                                       className="text-white/20 group-hover:text-purple-400 transition-colors duration-200"
                                    />
                                 </div>
                              </motion.div>
                           </Link>
                        ))
                     )}
                     <div className="h-2" />
                  </div>
               </motion.div>

               {/* Recent Payouts */}
               <motion.div
                  custom={1}
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden"
               >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                     <h2 className="text-white font-bold text-sm tracking-tight">
                        Recent Payouts
                     </h2>
                     <span className="text-[10px] text-white/20 font-medium uppercase tracking-widest">
                        Auto-settled
                     </span>
                  </div>

                  <div className="p-3 flex flex-col gap-1">
                     {payouts.length === 0 ? (
                        <EmptyState message="No payouts yet." />
                     ) : (
                        payouts.slice(0, 5).map((p, i) => (
                           <motion.div
                              key={p.id}
                              custom={i}
                              variants={payoutRowVariants}
                              initial="hidden"
                              animate="visible"
                              className="flex items-center justify-between gap-3 px-3 py-3.5 rounded-xl hover:bg-white/[0.03] transition-colors duration-200 cursor-default"
                           >
                              <div>
                                 <p className="text-white text-sm font-semibold mb-0.5">
                                    {p.tournamentName}
                                 </p>
                                 <p className="text-white/25 text-xs">
                                    {timeAgo(p.timestamp)}
                                 </p>
                              </div>
                              <motion.span
                                 initial={{ opacity: 0, scale: 0.8 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{
                                    delay: 0.4 + i * 0.1,
                                    duration: 0.35,
                                 }}
                                 className="text-emerald-400 font-black text-sm shrink-0"
                              >
                                 +{p.amount.toLocaleString()} USDC
                              </motion.span>
                           </motion.div>
                        ))
                     )}
                     <div className="h-2" />
                  </div>
               </motion.div>
            </div>
         </div>
      </div>
   );
}
