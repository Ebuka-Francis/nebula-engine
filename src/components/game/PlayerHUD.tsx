'use client';

import { useEffect, useState } from 'react';
import { GamePlayer } from '../../../types';

// Seat positions around the table — index 0 is always YOU (bottom center)
const SEAT_POSITIONS = [
   { bottom: '8rem', left: '50%', transform: 'translateX(-50%)' }, // 0 - You (bottom center)
   { bottom: '20%', left: '8%' }, // 1 - bottom left
   { top: '35%', left: '2%' }, // 2 - left
   { top: '12%', left: '15%' }, // 3 - top left
   { top: '4%', left: '50%', transform: 'translateX(-50%)' }, // 4 - top center
   { top: '12%', right: '15%' }, // 5 - top right
   { top: '35%', right: '2%' }, // 6 - right
   { bottom: '20%', right: '8%' }, // 7 - bottom right
];

interface Props {
   player: GamePlayer;
   isCurrentTurn: boolean;
   isMe: boolean;
   turnDeadline: number | null;
   seatIndex: number; // relative seat (0 = you)
}

export default function PlayerHUD({
   player,
   isCurrentTurn,
   isMe,
   turnDeadline,
   seatIndex,
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

   const position = SEAT_POSITIONS[seatIndex % SEAT_POSITIONS.length];

   const statusColorMap: Record<string, string> = {
      active: 'border-white/20',
      folded: 'border-red-500/20 opacity-40',
      'all-in': 'border-yellow-500/40',
      'sitting-out': 'border-white/10 opacity-30',
      eliminated: 'border-red-500/10 opacity-20',
   };

   // Access using the map with a fallback
   const statusColor =
      player.status && statusColorMap[player.status]
         ? statusColorMap[player.status]
         : 'border-white/20';

   return (
      <div
         className="absolute pointer-events-none"
         style={position as React.CSSProperties}
      >
         <div className="flex flex-col items-center gap-1.5">
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
               className={`px-3 py-2 rounded-xl border ${statusColor} ${
                  isMe
                     ? 'bg-purple-600/30 border-purple-500/50 shadow-[0_0_16px_rgba(139,92,246,0.4)]'
                     : 'bg-black/70'
               } backdrop-blur-sm flex flex-col items-center gap-0.5 min-w-[90px]`}
            >
               {/* Username */}
               <span
                  className={`text-xs font-bold truncate max-w-[80px] ${isMe ? 'text-purple-200' : 'text-white/80'}`}
               >
                  {player.username || `${player.address.slice(0, 4)}...`}
                  {isMe && (
                     <span className="text-purple-400 text-[9px]"> (You)</span>
                  )}
               </span>

               {/* Chips */}
               <span className="text-emerald-400 text-xs font-black">
                  {player.chips.toLocaleString()} 🪙
               </span>

               {/* Last action */}
               {player.lastAction && (
                  <span
                     className={`text-[9px] uppercase tracking-wider font-bold ${
                        player.lastAction === 'fold'
                           ? 'text-red-400'
                           : player.lastAction === 'raise'
                             ? 'text-yellow-400'
                             : player.lastAction === 'all-in'
                               ? 'text-orange-400'
                               : 'text-white/40'
                     }`}
                  >
                     {player.lastAction}
                  </span>
               )}

               {/* Current bet */}
               {(player?.currentBet ?? 0) > 0 && (
                  <span className="text-yellow-400 text-[9px] font-semibold">
                     Bet: {player.currentBet}
                  </span>
               )}
            </div>

            {/* Dealer/Blind badges */}
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
               {player.status === 'all-in' && (
                  <span className="text-[8px] font-black bg-yellow-500 text-black px-1.5 py-0.5 rounded-full">
                     ALL IN
                  </span>
               )}
               {player.status === 'folded' && (
                  <span className="text-[8px] font-black bg-red-500/50 text-white px-1.5 py-0.5 rounded-full">
                     FOLD
                  </span>
               )}
            </div>
         </div>
      </div>
   );
}
