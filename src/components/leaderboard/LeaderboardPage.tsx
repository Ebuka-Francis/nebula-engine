'use client';

import { motion, Variants } from 'framer-motion';
import { Trophy, Crown, Medal } from 'lucide-react';

const players = [
   {
      rank: 1,
      address: '0x1a2b...3c4d',
      wins: 42,
      earnings: '125,000 USDC',
      winRate: '68%',
   },
   {
      rank: 2,
      address: '0x5a6F...7g8h',
      wins: 38,
      earnings: '98,500 USDC',
      winRate: '62%',
   },
   {
      rank: 3,
      address: '0x9i0J...1k21',
      wins: 35,
      earnings: '87,200 USDC',
      winRate: '58%',
   },
   {
      rank: 4,
      address: '0x3m4n...5o6p',
      wins: 31,
      earnings: '72,400 USDC',
      winRate: '55%',
   },
   {
      rank: 5,
      address: '0x7q8r...9s0t',
      wins: 28,
      earnings: '64,100 USDC',
      winRate: '52%',
   },
   {
      rank: 6,
      address: '0xab12...cd34',
      wins: 25,
      earnings: '51,800 USDC',
      winRate: '49%',
   },
   {
      rank: 7,
      address: '0xef56...gh78',
      wins: 22,
      earnings: '43,800 USDC',
      winRate: '47%',
   },
   {
      rank: 8,
      address: '0xi j98...k112',
      wins: 19,
      earnings: '35,200 USDC',
      winRate: '44%',
   },
   {
      rank: 9,
      address: '0xmn34...op56',
      wins: 16,
      earnings: '28,800 USDC',
      winRate: '41%',
   },
   {
      rank: 10,
      address: '0xqr78...st90',
      wins: 14,
      earnings: '22,100 USDC',
      winRate: '38%',
   },
];

const podiumOrder = [players[1], players[0], players[2]]; // 2nd, 1st, 3rd

const podiumConfig = {
   1: {
      height: 'h-28',
      label: '#1',
      labelColor: 'text-yellow-400',
      border: 'border-yellow-400/40',
      bg: 'bg-yellow-400/10',
      glow: 'shadow-[0_0_30px_rgba(250,204,21,0.2)]',
      icon: Crown,
      iconColor: 'text-yellow-400',
      iconBg: 'bg-yellow-400/15 border-yellow-400/30',
      earningsColor: 'text-yellow-300',
   },
   2: {
      height: 'h-20',
      label: '#2',
      labelColor: 'text-slate-300',
      border: 'border-slate-400/30',
      bg: 'bg-slate-400/5',
      glow: 'shadow-[0_0_20px_rgba(148,163,184,0.1)]',
      icon: Medal,
      iconColor: 'text-slate-300',
      iconBg: 'bg-slate-400/15 border-slate-400/30',
      earningsColor: 'text-slate-300',
   },
   3: {
      height: 'h-16',
      label: '#3',
      labelColor: 'text-orange-400',
      border: 'border-orange-400/30',
      bg: 'bg-orange-400/5',
      glow: 'shadow-[0_0_20px_rgba(251,146,60,0.1)]',
      icon: Medal,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-400/15 border-orange-400/30',
      earningsColor: 'text-orange-300',
   },
};

const statVariants: Variants = {
   hidden: { opacity: 0, y: 40, scale: 0.95 },
   visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
   }),
};

const rowVariants: Variants = {
   hidden: { opacity: 0, x: -24 },
   visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: 0.3 + i * 0.06, ease: 'easeOut' },
   }),
};

const podiumVariants: Variants = {
   hidden: { opacity: 0, y: 50 },
   visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.1 + i * 0.12, ease: 'easeOut' },
   }),
};

function RankLabel({ rank }: { rank: number }) {
   const colors: Record<number, string> = {
      1: 'text-yellow-400',
      2: 'text-slate-300',
      3: 'text-orange-400',
   };
   return (
      <span className={`text-sm font-black ${colors[rank] ?? 'text-white/30'}`}>
         #{rank}
      </span>
   );
}

export default function LeaderboardPage() {
   return (
      <div className="min-h-screen bg-[#0d0d0f] px-4 md:px-8 py-10 font-sans">
         {/* Bg glow */}
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-700/8 blur-[120px] rounded-full pointer-events-none z-0" />
         <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-yellow-500/4 blur-[100px] rounded-full pointer-events-none z-0" />

         <div className="relative z-10 max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.45 }}
               className="mb-10"
            >
               <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/15 border border-cyan-400/25 flex items-center justify-center">
                     <Trophy size={15} className="text-cyan-400" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                     Global Leaderboard
                  </h1>
               </div>
               <p className="text-[#6b6b80] text-sm ml-11">
                  Top players across all Nebula tournaments
               </p>
            </motion.div>

            {/* Podium */}
            <div className="mb-8">
               {/* Player info cards — top row */}
               <div className="grid grid-cols-3 gap-3 mb-0">
                  {podiumOrder.map((player, i) => {
                     const cfg = podiumConfig[player.rank as 1 | 2 | 3];
                     const Icon = cfg.icon;
                     return (
                        <motion.div
                           key={player.rank}
                           custom={i}
                           variants={statVariants}
                           initial="hidden"
                           animate="visible"
                           className={`relative flex flex-col items-center text-center gap-2 p-4 rounded-t-2xl border ${cfg.border} ${cfg.bg} ${cfg.glow} overflow-hidden`}
                        >
                           {/* Subtle dot pattern */}
                           <div
                              className="absolute inset-0 opacity-5 pointer-events-none"
                              style={{
                                 backgroundImage:
                                    'radial-gradient(circle, white 1px, transparent 1px)',
                                 backgroundSize: '10px 10px',
                              }}
                           />
                           <div
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center ${cfg.iconBg}`}
                           >
                              <Icon size={16} className={cfg.iconColor} />
                           </div>
                           <div>
                              <p className="text-white font-mono text-xs font-semibold mb-0.5">
                                 {player.address}
                              </p>
                              <p
                                 className={`text-base font-black ${cfg.earningsColor}`}
                              >
                                 {player.earnings}
                              </p>
                              <p className="text-white/25 text-[10px]">
                                 {player.wins} wins
                              </p>
                           </div>
                        </motion.div>
                     );
                  })}
               </div>

               {/* Podium blocks — bottom row */}
               <div className="grid grid-cols-3 gap-3">
                  {podiumOrder.map((player, i) => {
                     const cfg = podiumConfig[player.rank as 1 | 2 | 3];
                     return (
                        <motion.div
                           key={`block-${player.rank}`}
                           custom={i}
                           variants={podiumVariants}
                           initial="hidden"
                           animate="visible"
                           className={`${cfg.height} flex items-center justify-center rounded-b-2xl border-x border-b ${cfg.border} ${cfg.bg}`}
                        >
                           <span
                              className={`text-3xl font-black ${cfg.labelColor}`}
                           >
                              {cfg.label}
                           </span>
                        </motion.div>
                     );
                  })}
               </div>
            </div>

            {/* Full Table */}
            <motion.div
               initial={{ opacity: 0, y: 24 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden"
            >
               {/* Table header */}
               <div className="grid grid-cols-[60px_1fr_60px_140px_70px] gap-2 px-5 py-3 border-b border-white/[0.05]">
                  {['RANK', 'PLAYER', 'WINS', 'EARNINGS', 'WIN %'].map((h) => (
                     <span
                        key={h}
                        className="text-[10px] font-semibold text-white/25 uppercase tracking-widest"
                     >
                        {h}
                     </span>
                  ))}
               </div>

               {/* Rows */}
               {players.map((player, i) => (
                  <motion.div
                     key={player.rank}
                     custom={i}
                     variants={rowVariants}
                     initial="hidden"
                     animate="visible"
                     whileHover={{
                        x: 4,
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        transition: { duration: 0.15 },
                     }}
                     className={`grid grid-cols-[60px_1fr_60px_140px_70px] gap-2 items-center px-5 py-3.5 border-b border-white/[0.03] last:border-0 transition-colors duration-150 cursor-default ${
                        player.rank === 1
                           ? 'bg-yellow-400/[0.03]'
                           : player.rank === 2
                             ? 'bg-slate-400/[0.02]'
                             : player.rank === 3
                               ? 'bg-orange-400/[0.02]'
                               : ''
                     }`}
                  >
                     <RankLabel rank={player.rank} />
                     <span className="text-white/60 text-xs font-mono">
                        {player.address}
                     </span>
                     <span className="text-white text-sm font-bold">
                        {player.wins}
                     </span>
                     <span
                        className={`text-sm font-black ${
                           player.rank === 1
                              ? 'text-yellow-400'
                              : player.rank === 2
                                ? 'text-slate-300'
                                : player.rank === 3
                                  ? 'text-orange-300'
                                  : 'text-purple-400'
                        }`}
                     >
                        {player.earnings}
                     </span>
                     <span className="text-white/40 text-sm font-semibold">
                        {player.winRate}
                     </span>
                  </motion.div>
               ))}
            </motion.div>
         </div>
      </div>
   );
}
