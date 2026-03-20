'use client';

import { motion, Variants } from 'framer-motion';
import { Tournament } from '../../../../types';

const rowVariants: Variants = {
   hidden: { opacity: 0, x: -24 },
   visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' },
   }),
};

export default function LeaderboardTab({
   tournament,
}: {
   tournament: Tournament;
}) {
   return (
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
   );
}
