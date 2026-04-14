'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Trophy, Crown, Medal, Loader2 } from 'lucide-react';
import {
   collection,
   query,
   orderBy,
   limit,
   onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Updated interface to reflect that 'username' is what we are displaying
interface Player {
   rank: number;
   username: string; // Changed from address to username
   wins: number;
   earnings: string;
   winRate: string;
}

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
   const [players, setPlayers] = useState<Player[]>([]);
   const [loading, setLoading] = useState(true);

   // Animation Variants
   const statVariants: Variants = {
      hidden: { opacity: 0, y: 40, scale: 0.95 },
      visible: (i: number) => ({
         opacity: 1,
         y: 0,
         scale: 1,
         transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
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
   const rowVariants: Variants = {
      hidden: { opacity: 0, x: -24 },
      visible: (i: number) => ({
         opacity: 1,
         x: 0,
         transition: { duration: 0.4, delay: 0.3 + i * 0.06, ease: 'easeOut' },
      }),
   };

   useEffect(() => {
      const q = query(
         collection(db, 'players'),
         orderBy('totalEarnings', 'desc'),
         limit(10),
      );

      const unsubscribe = onSnapshot(
         q,
         (snapshot) => {
            const fetchedPlayers = snapshot.docs.map((doc, index) => {
               const data = doc.data();
               const wins = data.wins || 0;
               const totalGames = wins + (data.losses || 0);

               // Prioritize username, then name, then shortened wallet as ultimate fallback
               const finalUsername =
                  data.username ||
                  data.name ||
                  `${doc.id.slice(0, 6)}...${doc.id.slice(-4)}`;

               return {
                  rank: index + 1,
                  username: finalUsername,
                  wins: wins,
                  earnings: `${(data.totalEarnings || 0).toLocaleString()} USDC`,
                  winRate:
                     totalGames > 0
                        ? `${Math.round((wins / totalGames) * 100)}%`
                        : '0%',
               };
            });

            setPlayers(fetchedPlayers);
            setLoading(false);
         },
         (error) => {
            console.error('Firestore Error:', error);
            setLoading(false);
         },
      );

      return () => unsubscribe();
   }, []);

   const podiumOrder =
      players.length >= 3 ? [players[1], players[0], players[2]] : players;

   if (loading) {
      return (
         <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
            <Loader2 className="text-purple-500 animate-spin" size={40} />
         </div>
      );
   }
   console.log('players>>>>>>', players);

   return (
      <div className="min-h-screen bg-[#0d0d0f] px-4 md:px-8 py-10 font-sans">
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-700/8 blur-[120px] rounded-full pointer-events-none z-0" />

         <div className="relative z-10 max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
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
                  Top players in the Nebula Engine
               </p>
            </motion.div>

            {/* Podium */}
            {players.length >= 3 && (
               <div className="mb-8">
                  <div className="grid grid-cols-3 gap-3">
                     {podiumOrder.map((player, i) => {
                        const cfg = podiumConfig[player.rank as 1 | 2 | 3];
                        return (
                           <motion.div
                              key={player.rank}
                              custom={i}
                              variants={statVariants}
                              initial="hidden"
                              animate="visible"
                              className={`relative flex flex-col items-center text-center gap-2 p-4 rounded-t-2xl border ${cfg.border} ${cfg.bg} ${cfg.glow}`}
                           >
                              <div
                                 className={`w-9 h-9 rounded-xl border flex items-center justify-center ${cfg.iconBg}`}
                              >
                                 <cfg.icon
                                    size={16}
                                    className={cfg.iconColor}
                                 />
                              </div>
                              <div className="w-full">
                                 <p className="text-white text-xs font-bold mb-0.5 truncate px-2">
                                    {player.username}
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
            )}

            {/* Table */}
            <motion.div
               initial={{ opacity: 0, y: 24 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden"
            >
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

               {players.map((player, i) => (
                  <motion.div
                     key={player.rank}
                     custom={i}
                     variants={rowVariants}
                     initial="hidden"
                     animate="visible"
                     className={`grid grid-cols-[60px_1fr_60px_140px_70px] gap-2 items-center px-5 py-3.5 border-b border-white/[0.03] last:border-0 ${
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
                     <span className="text-white/80 text-sm font-semibold truncate pr-4 font-sans">
                        {player.username}
                     </span>
                     <span className="text-white text-sm font-bold">
                        {player.wins}
                     </span>
                     <span
                        className={`text-sm font-black ${player.rank === 1 ? 'text-yellow-400' : player.rank === 2 ? 'text-slate-300' : player.rank === 3 ? 'text-orange-300' : 'text-purple-400'}`}
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
