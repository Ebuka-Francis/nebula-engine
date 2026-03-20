'use client';

import { useEffect, useState } from 'react';
import { GamePlayer } from '../../../types';

interface Props {
   player: GamePlayer;
   isCurrentTurn: boolean;
   isMe: boolean;
   turnDeadline: number | null;
}

export default function PlayerHUD({
   player,
   isCurrentTurn,
   isMe,
   turnDeadline,
}: Props) {
   const [timeLeft, setTimeLeft] = useState(30);

   useEffect(() => {
      if (!isCurrentTurn || !turnDeadline) return;
      const interval = setInterval(() => {
         const remaining = Math.max(
            0,
            Math.ceil((turnDeadline - Date.now()) / 1000),
         );
         setTimeLeft(remaining);
      }, 500);
      return () => clearInterval(interval);
   }, [isCurrentTurn, turnDeadline]);

   const statusColor =
      {
         active: 'border-white/20',
         folded: 'border-red-500/20 opacity-40',
         'all-in': 'border-yellow-500/40',
         'sitting-out': 'border-white/10 opacity-30',
         eliminated: 'border-red-500/10 opacity-20',
      }[player.status] ?? 'border-white/20';

   return (
      <div
         className={`absolute flex flex-col items-center gap-1 pointer-events-none`}
         style={{
            // Positioned based on seat index — simplified for now
            bottom: isMe ? '8rem' : 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
         }}
      >
         {/* Turn timer ring */}
         {isCurrentTurn && (
            <div className="relative w-10 h-10 mb-1">
               <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle
                     cx="18"
                     cy="18"
                     r="15"
                     fill="none"
                     stroke="#ffffff20"
                     strokeWidth="3"
                  />
                  <circle
                     cx="18"
                     cy="18"
                     r="15"
                     fill="none"
                     stroke={timeLeft <= 5 ? '#ef4444' : '#a855f7'}
                     strokeWidth="3"
                     strokeDasharray={`${(timeLeft / 30) * 94} 94`}
                     className="transition-all duration-500"
                  />
               </svg>
               <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-black">
                  {timeLeft}
               </span>
            </div>
         )}

         {/* Player card */}
         <div
            className={`px-3 py-1.5 rounded-xl border ${statusColor} ${
               isMe ? 'bg-purple-600/20' : 'bg-black/60'
            } backdrop-blur-sm flex flex-col items-center gap-0.5 min-w-[80px]`}
         >
            <span className="text-white text-[10px] font-bold truncate max-w-[80px]">
               {player.username || `${player.address.slice(0, 4)}...`}
               {isMe && <span className="text-purple-400"> (You)</span>}
            </span>
            <span className="text-emerald-400 text-[10px] font-black">
               {player.chips.toLocaleString()}
            </span>
            {player.lastAction && (
               <span className="text-[9px] text-white/30 uppercase tracking-wider">
                  {player.lastAction}
               </span>
            )}
            {player.status === 'all-in' && (
               <span className="text-yellow-400 text-[9px] font-black uppercase">
                  All-in
               </span>
            )}
         </div>

         {/* Dealer / Blind badges */}
         <div className="flex gap-1">
            {player.isDealer && (
               <span className="text-[8px] font-black bg-white text-black px-1.5 py-0.5 rounded-full">
                  D
               </span>
            )}
            {player.isSmallBlind && (
               <span className="text-[8px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                  SB
               </span>
            )}
            {player.isBigBlind && (
               <span className="text-[8px] font-black bg-purple-600 text-white px-1.5 py-0.5 rounded-full">
                  BB
               </span>
            )}
         </div>
      </div>
   );
}
