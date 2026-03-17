'use client';

import { useState } from 'react';
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

const tournament = {
   name: 'Nebula Grand Prix',
   status: 'live',
   creator: '0x1a2b...3c4d',
   entry: '50 USDC',
   prizePool: '5,000 USDC',
   players: '87 / 100',
   timeLeft: 'Live Now',
};

const leaderboard = [
   { rank: 1, address: '0x1a2b...3c4d', score: 2450, prize: '2,500 USDC' },
   { rank: 2, address: '0x5a6F...7g8h', score: 2180, prize: '1,250 USDC' },
   { rank: 3, address: '0x9i0J...1k21', score: 1950, prize: '625 USDC' },
   { rank: 4, address: '0x3m4n...5o6p', score: 1720, prize: '312 USDC' },
   { rank: 5, address: '0x7q8r...9s0t', score: 1580, prize: '156 USDC' },
   { rank: 6, address: '0xab12...cd34', score: 1420, prize: '78 USDC' },
   { rank: 7, address: '0xef56...gh78', score: 1310, prize: '39 USDC' },
   { rank: 8, address: '0xi j98...k112', score: 1200, prize: '20 USDC' },
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

const payouts = [
   { place: '1st Place', pct: '50%', amount: '2,500 USDC' },
   { place: '2nd Place', pct: '25%', amount: '1,250 USDC' },
   { place: '3rd Place', pct: '12.5%', amount: '625 USDC' },
   { place: '4th Place', pct: '6.25%', amount: '312 USDC' },
   { place: '5th Place', pct: '3.125%', amount: '156 USDC' },
   { place: '6th–8th Place', pct: '~1.5% each', amount: '~78 USDC' },
];

const predictions = [
   {
      label: '1st Place Winner',
      favorite: '0x1a2b...3c4d',
      odds: '2.1x',
      pool: '320 USDC',
   },
   {
      label: '2nd Place',
      favorite: '0x5a6F...7g8h',
      odds: '3.4x',
      pool: '180 USDC',
   },
   {
      label: '3rd Place',
      favorite: '0x9i0J...1k21',
      odds: '5.0x',
      pool: '95 USDC',
   },
];

const tabs = [
   { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
   { id: 'rules', label: 'Rules', icon: ScrollText },
   { id: 'payouts', label: 'Payouts', icon: Coins },
   { id: 'predictions', label: 'Predictions', icon: Brain },
];

const rowVariants: Variants = {
   hidden: { opacity: 0, x: -24 },
   visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' },
   }),
};

const contentVariants: Variants = {
   hidden: { opacity: 0, y: 16 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
   },
};

function RankBadge({ rank }: { rank: number }) {
   if (rank === 1)
      return (
         <span className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-400/15 border border-yellow-400/30">
            <Crown size={13} className="text-yellow-400" />
         </span>
      );
   if (rank === 2)
      return (
         <span className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-400/10 border border-slate-400/20 text-slate-300 text-xs font-black">
            #2
         </span>
      );
   if (rank === 3)
      return (
         <span className="w-7 h-7 flex items-center justify-center rounded-full bg-orange-400/10 border border-orange-400/20 text-orange-300 text-xs font-black">
            #3
         </span>
      );
   return (
      <span className="w-7 h-7 flex items-center justify-center text-white/25 text-xs font-bold">
         #{rank}
      </span>
   );
}

export default function TournamentDetailPage() {
   const [activeTab, setActiveTab] = useState('leaderboard');

   return (
      <div className="min-h-screen bg-[#0d0d0f] px-4 md:px-8 py-10 font-sans">
         {/* Bg glow */}
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
               {/* Top row */}
               <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                  <div>
                     <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                           {tournament.name}
                        </h1>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                           Live
                        </span>
                     </div>
                     <p className="text-white/30 text-xs">
                        Poker Tournament &nbsp;•&nbsp; Created by{' '}
                        <span className="text-purple-400/70">
                           {tournament.creator}
                        </span>
                     </p>
                  </div>

                  <motion.button
                     whileHover={{
                        scale: 1.04,
                        boxShadow: '0 0 30px rgba(139,92,246,0.6)',
                     }}
                     whileTap={{ scale: 0.97 }}
                     className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] shrink-0 cursor-pointer"
                  >
                     <Plus size={15} />
                     Join Tournament
                  </motion.button>
               </div>

               {/* Stats row */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                     { icon: Zap, label: 'Entry Fee', value: tournament.entry },
                     {
                        icon: Trophy,
                        label: 'Prize Pool',
                        value: tournament.prizePool,
                     },
                     {
                        icon: Users,
                        label: 'Players',
                        value: tournament.players,
                     },
                     {
                        icon: Clock,
                        label: 'Time Left',
                        value: tournament.timeLeft,
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
                     {/* Table header */}
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
                     {leaderboard.map((row, i) => (
                        <motion.div
                           key={row.rank}
                           custom={i}
                           variants={rowVariants}
                           initial="hidden"
                           animate="visible"
                           className={`grid grid-cols-[40px_1fr_80px_100px] gap-2 items-center px-5 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors duration-150 ${
                              row.rank === 1 ? 'bg-yellow-400/[0.03]' : ''
                           }`}
                        >
                           <RankBadge rank={row.rank} />
                           <span className="text-white/70 text-xs font-mono">
                              {row.address}
                           </span>
                           <span className="text-white text-sm font-semibold">
                              {row.score}
                           </span>
                           <span
                              className={`text-sm font-bold ${
                                 row.rank === 1
                                    ? 'text-yellow-400'
                                    : row.rank === 2
                                      ? 'text-slate-300'
                                      : row.rank === 3
                                        ? 'text-orange-300'
                                        : 'text-purple-400'
                              }`}
                           >
                              {row.prize}
                           </span>
                        </motion.div>
                     ))}
                  </div>
               )}

               {/* RULES */}
               {activeTab === 'rules' && (
                  <div className="p-5 flex flex-col gap-3">
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
                     {payouts.map((row, i) => (
                        <motion.div
                           key={row.place}
                           custom={i}
                           variants={rowVariants}
                           initial="hidden"
                           animate="visible"
                           className={`grid grid-cols-3 gap-2 items-center px-5 py-3 border-b border-white/[0.03] last:border-0 ${
                              i === 0 ? 'bg-yellow-400/[0.03]' : ''
                           }`}
                        >
                           <span
                              className={`text-sm font-semibold ${i === 0 ? 'text-yellow-400' : 'text-white/50'}`}
                           >
                              {row.place}
                           </span>
                           <span className="text-white/40 text-sm">
                              {row.pct}
                           </span>
                           <span
                              className={`text-sm font-bold ${i === 0 ? 'text-yellow-400' : 'text-purple-400'}`}
                           >
                              {row.amount}
                           </span>
                        </motion.div>
                     ))}
                     <p className="text-[10px] text-white/20 px-5 py-3">
                        Payouts are automated via Rain Protocol escrow.
                     </p>
                  </div>
               )}

               {/* PREDICTIONS */}
               {activeTab === 'predictions' && (
                  <div className="p-5 flex flex-col gap-3">
                     {predictions.map((pred, i) => (
                        <motion.div
                           key={pred.label}
                           custom={i}
                           variants={rowVariants}
                           initial="hidden"
                           animate="visible"
                           className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-purple-500/30 transition-colors duration-200"
                        >
                           <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
                                 {pred.label}
                              </span>
                              <span className="text-white text-sm font-mono font-semibold">
                                 {pred.favorite}
                              </span>
                              <span className="text-[10px] text-white/30">
                                 Pool:{' '}
                                 <span className="text-purple-400">
                                    {pred.pool}
                                 </span>
                              </span>
                           </div>
                           <div className="flex flex-col items-end gap-2">
                              <span className="text-cyan-400 font-black text-lg">
                                 {pred.odds}
                              </span>
                              <motion.button
                                 whileHover={{ scale: 1.04 }}
                                 whileTap={{ scale: 0.97 }}
                                 className="px-4 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors duration-200 cursor-pointer"
                              >
                                 Place Bet
                              </motion.button>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               )}
            </motion.div>
         </div>
      </div>
   );
}
