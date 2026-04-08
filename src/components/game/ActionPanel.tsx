'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '../../../types';

interface Props {
   tournamentId: string;
   gameState: GameState;
   playerAddress: string;
   onAction: (type: string, amount?: number) => Promise<void>;
   isAllInRunout?: boolean; // ← add this
}

export default function ActionPanel({
   gameState,
   playerAddress,
   onAction,
   isAllInRunout = false,
}: Props) {
   const player = gameState.players[playerAddress];

   const [raiseAmount, setRaiseAmount] = useState(gameState.bigBlind * 2);
   const [loadingAction, setLoadingAction] = useState<string | null>(null);
   const [showRaiseSlider, setShowRaiseSlider] = useState(false);

   const canCheck = gameState.currentBet === (player?.currentBet ?? 0);
   const callAmount = gameState.currentBet - (player?.currentBet ?? 0);
   const minRaise = gameState.currentBet + gameState.bigBlind;

   const handleButtonClick = async (action: string, amount?: number) => {
      if (action === 'raise' && !showRaiseSlider) {
         setShowRaiseSlider(true);
         return;
      }
      setLoadingAction(action);
      try {
         await onAction(action, amount);
         setShowRaiseSlider(false);
      } catch (err) {
         console.error('Action execution failed:', err);
      } finally {
         setLoadingAction(null);
      }
   };

   // ── All-in runout view — just show which street is coming next ──
   if (isAllInRunout) {
      const nextStreet: Record<string, string> = {
         preflop: 'Flop',
         flop: 'Turn',
         turn: 'River',
         river: 'Showdown',
      };
      const label = nextStreet[gameState.phase] ?? 'Next Street';

      return (
         <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto p-4 pb-2"
         >
            <div className="bg-black/90 backdrop-blur-xl border border-yellow-500/20 rounded-3xl p-4 shadow-2xl flex flex-col gap-3 items-center">
               <p className="text-yellow-400 text-xs font-black uppercase tracking-widest">
                  All-In — Cards Running Out
               </p>
               <button
                  onClick={() => handleButtonClick('check')}
                  disabled={!!loadingAction}
                  className="w-full py-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-black uppercase tracking-wider hover:bg-yellow-500/20 transition-all disabled:opacity-50"
               >
                  {loadingAction ? '...' : `Deal ${label}`}
               </button>
            </div>
         </motion.div>
      );
   }

   return (
      <motion.div
         initial={{ opacity: 0, y: 40 }}
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-md mx-auto p-4 pb-8"
      >
         <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl flex flex-col gap-4">
            <AnimatePresence>
               {showRaiseSlider && (
                  <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden flex flex-col gap-3 border-b border-white/5 pb-4"
                  >
                     <div className="flex justify-between items-end">
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">
                           Adjust Raise
                        </span>
                        <span className="text-purple-400 font-black text-lg">
                           {raiseAmount.toLocaleString()}{' '}
                           <span className="text-[10px]">USDC</span>
                        </span>
                     </div>
                     <input
                        type="range"
                        min={minRaise}
                        max={player?.chips ?? 0}
                        value={raiseAmount}
                        onChange={(e) => setRaiseAmount(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                     />
                     <div className="flex justify-between text-[9px] font-bold text-white/20">
                        <span>MIN: {minRaise}</span>
                        <span>MAX: {player?.chips}</span>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            <div className="grid grid-cols-4 gap-2">
               <button
                  onClick={() => handleButtonClick('fold')}
                  disabled={!!loadingAction}
                  className="flex flex-col items-center justify-center py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all disabled:opacity-50"
               >
                  <span className="text-xs font-black uppercase tracking-tighter">
                     {loadingAction === 'fold' ? '...' : 'Fold'}
                  </span>
               </button>

               <button
                  onClick={() => handleButtonClick(canCheck ? 'check' : 'call')}
                  disabled={!!loadingAction}
                  className="flex flex-col items-center justify-center py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
               >
                  <span className="text-xs font-black uppercase tracking-tighter">
                     {loadingAction === 'check' || loadingAction === 'call'
                        ? '...'
                        : canCheck
                          ? 'Check'
                          : 'Call'}
                  </span>
                  {!canCheck && (
                     <span className="text-[9px] font-bold opacity-60">
                        {callAmount}
                     </span>
                  )}
               </button>

               <button
                  onClick={() => handleButtonClick('raise', raiseAmount)}
                  disabled={!!loadingAction || (player?.chips ?? 0) < minRaise}
                  className={`flex flex-col items-center justify-center py-3 rounded-2xl transition-all disabled:opacity-50 ${
                     showRaiseSlider
                        ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                        : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                  }`}
               >
                  <span className="text-xs font-black uppercase tracking-tighter">
                     {loadingAction === 'raise'
                        ? '...'
                        : showRaiseSlider
                          ? 'Confirm'
                          : 'Raise'}
                  </span>
               </button>

               <button
                  onClick={() => handleButtonClick('all-in', player?.chips)}
                  disabled={!!loadingAction}
                  className="flex flex-col items-center justify-center py-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20 transition-all disabled:opacity-50"
               >
                  <span className="text-xs font-black uppercase tracking-tighter">
                     {loadingAction === 'all-in' ? '...' : 'All In'}
                  </span>
                  <span className="text-[9px] font-bold opacity-60">
                     {player?.chips}
                  </span>
               </button>
            </div>

            <div className="flex justify-between items-center px-1">
               <div className="flex flex-col">
                  <span className="text-[8px] text-white/20 uppercase font-black">
                     Available Balance
                  </span>
                  <span className="text-white/60 text-xs font-bold">
                     {player?.chips.toLocaleString()} USDC
                  </span>
               </div>
               {showRaiseSlider && (
                  <button
                     onClick={() => setShowRaiseSlider(false)}
                     className="text-[9px] text-white/30 hover:text-white underline uppercase font-bold"
                  >
                     Cancel Raise
                  </button>
               )}
            </div>
         </div>
      </motion.div>
   );
}
