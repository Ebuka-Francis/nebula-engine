'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tournament } from '../../../../types';
import { motion, Variants } from 'framer-motion';
import { Crown } from 'lucide-react';

interface Registration {
   address: string;
   username: string;
   score?: number;
   joinedAt?: number;
}

const rowVariants: Variants = {
   hidden: { opacity: 0, x: -24 },
   visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' },
   }),
};

const RANK_STYLES: Record<number, { badge: string; crown?: boolean }> = {
   1: { badge: 'text-yellow-400 font-black', crown: true },
   2: { badge: 'text-slate-300 font-bold' },
   3: { badge: 'text-amber-600 font-bold' },
};

function rankLabel(i: number) {
   if (i === 1) return '1st';
   if (i === 2) return '2nd';
   if (i === 3) return '3rd';
   return `${i}th`;
}

export default function LeaderboardTab({
   tournament,
}: {
   tournament: Tournament;
}) {
   const [players, setPlayers] = useState<Registration[]>([]);
   const [loading, setLoading] = useState(true);



 

   useEffect(() => {
      if (!tournament?.id) return;

      const ref = collection(db, 'tournaments', tournament.id, 'registrations');

      // Order by score desc if game has started, otherwise by joinedAt asc
      const q =
         tournament.status === 'live' || tournament.status === 'ended'
            ? query(ref, orderBy('score', 'desc'))
            : query(ref, orderBy('joinedAt', 'asc'));

      const unsubscribe = onSnapshot(q, (snap) => {
         const data = snap.docs.map((doc) => ({
            address: doc.id,
            ...doc.data(),
         })) as Registration[];
         setPlayers(data);
         setLoading(false);
      });

      return () => unsubscribe();
   }, [tournament?.id, tournament?.status]);

   const prizeForRank = (rank: number): string => {
      const pool = tournament.prizePool;
      if (!pool || pool === 0) return '—';
      if (rank === 1) return `${(pool * 0.6).toLocaleString()} USDC`;
      if (rank === 2) return `${(pool * 0.3).toLocaleString()} USDC`;
      if (rank === 3) return `${(pool * 0.1).toLocaleString()} USDC`;
      return '—';
   };

   return (
      <div>
         {/* Header */}
         <div className="grid grid-cols-[40px_1fr_80px_120px] gap-2 px-5 py-3 border-b border-white/[0.05]">
            {['RANK', 'PLAYER', 'SCORE', 'PRIZE'].map((h) => (
               <span
                  key={h}
                  className="text-[10px] font-semibold text-white/25 uppercase tracking-widest"
               >
                  {h}
               </span>
            ))}
         </div>

         {/* States */}
         {loading ? (
            <div className="py-10 space-y-3 px-5">
               {[...Array(3)].map((_, i) => (
                  <div
                     key={i}
                     className="h-10 rounded-xl bg-white/[0.03] animate-pulse"
                  />
               ))}
            </div>
         ) : players.length === 0 ? (
            <div className="py-14 text-center text-white/20 text-xs">
               No players have joined yet.
            </div>
         ) : (
            <div className="divide-y divide-white/[0.04]">
               {players.map((player, i) => {
                  const rank = i + 1;
                  const style = RANK_STYLES[rank];
                  const isTopThree = rank <= 3;

                  return (
                     <motion.div
                        key={player.address}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className={`grid grid-cols-[40px_1fr_80px_120px] gap-2 items-center px-5 py-3.5 transition-colors duration-150 hover:bg-white/[0.02] ${
                           rank === 1 ? 'bg-yellow-500/[0.03]' : ''
                        }`}
                     >
                        {/* Rank */}
                        <div
                           className={`flex items-center gap-1 text-sm ${style?.badge ?? 'text-white/30 font-semibold'}`}
                        >
                           {style?.crown ? (
                              <Crown size={13} className="text-yellow-400" />
                           ) : (
                              <span>{rankLabel(rank)}</span>
                           )}
                           {style?.crown && (
                              <span className="text-yellow-400 text-xs font-black">
                                 1st
                              </span>
                           )}
                        </div>

                        {/* Player */}
                        <div className="flex flex-col min-w-0">
                           <span className="text-white text-sm font-semibold truncate">
                              {player.username}
                           </span>
                           <span className="text-white/25 text-[10px] font-mono truncate">
                              {player.address.slice(0, 6)}...
                              {player.address.slice(-4)}
                           </span>
                        </div>

                        {/* Score */}
                        <span
                           className={`text-sm font-bold tabular-nums ${
                              isTopThree ? 'text-purple-300' : 'text-white/50'
                           }`}
                        >
                           {tournament.status === 'upcoming'
                              ? '—'
                              : (player.score ?? 0).toLocaleString()}
                        </span>

                        {/* Prize */}
                        <span
                           className={`text-xs font-semibold ${
                              rank === 1
                                 ? 'text-yellow-400'
                                 : rank === 2
                                   ? 'text-slate-300'
                                   : rank === 3
                                     ? 'text-amber-600'
                                     : 'text-white/20'
                           }`}
                        >
                           {prizeForRank(rank)}
                        </span>
                     </motion.div>
                  );
               })}
            </div>
         )}

         {/* Footer note */}
         {players.length > 0 && tournament.status === 'upcoming' && (
            <div className="px-5 py-3 border-t border-white/[0.05]">
               <p className="text-white/20 text-[10px] text-center">
                  Scores and prizes update once the game starts
               </p>
            </div>
         )}
      </div>
   );
}
