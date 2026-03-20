'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { GameState } from '../../../types';

interface Props {
   tournamentId: string;
   gameState: GameState;
   playerAddress: string;
}

export default function ActionPanel({
   tournamentId,
   gameState,
   playerAddress,
}: Props) {
   const [raiseAmount, setRaiseAmount] = useState(gameState.bigBlind * 2);
   const [loading, setLoading] = useState<string | null>(null);

   const player = gameState.players[playerAddress];
   const canCheck = gameState.currentBet === (player?.currentBet ?? 0);
   const callAmount = gameState.currentBet - (player?.currentBet ?? 0);

   const doAction = async (action: string, amount?: number) => {
      setLoading(action);
      try {
         const functions = getFunctions();
         const playerActionFn = httpsCallable(functions, 'playerAction');
         await playerActionFn({ tournamentId, action, amount });
      } catch (err) {
         console.error('Action error:', err);
      } finally {
         setLoading(null);
      }
   };

   return (
      <motion.div
         initial={{ opacity: 0, y: 40 }}
         animate={{ opacity: 1, y: 0 }}
         className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4"
      >
         <div className="bg-black/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3">
            {/* Your turn indicator */}
            <div className="flex items-center justify-center gap-2">
               <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_8px_#facc15]" />
               <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">
                  Your Turn
               </span>
            </div>

            {/* Raise slider */}
            <div className="flex flex-col gap-1.5">
               <div className="flex justify-between text-[10px] text-white/30">
                  <span>Raise Amount</span>
                  <span className="text-purple-400 font-bold">
                     {raiseAmount.toLocaleString()} USDC
                  </span>
               </div>
               <input
                  type="range"
                  min={gameState.bigBlind * 2}
                  max={player?.chips ?? 0}
                  value={raiseAmount}
                  onChange={(e) => setRaiseAmount(Number(e.target.value))}
                  className="w-full accent-purple-500"
               />
               <div className="flex justify-between text-[10px] text-white/20">
                  <span>Min: {(gameState.bigBlind * 2).toLocaleString()}</span>
                  <span>All-in: {player?.chips.toLocaleString()}</span>
               </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-4 gap-2">
               <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => doAction('fold')}
                  disabled={!!loading}
                  className="py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/30 transition-all disabled:opacity-50"
               >
                  {loading === 'fold' ? '...' : 'Fold'}
               </motion.button>

               <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => doAction(canCheck ? 'check' : 'call')}
                  disabled={!!loading}
                  className="py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-bold hover:bg-blue-500/30 transition-all disabled:opacity-50"
               >
                  {loading === 'check' || loading === 'call'
                     ? '...'
                     : canCheck
                       ? 'Check'
                       : `Call ${callAmount.toLocaleString()}`}
               </motion.button>

               <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => doAction('raise', raiseAmount)}
                  disabled={!!loading}
                  className="py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-bold hover:bg-purple-500/30 transition-all disabled:opacity-50"
               >
                  {loading === 'raise' ? '...' : 'Raise'}
               </motion.button>

               <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => doAction('all-in')}
                  disabled={!!loading}
                  className="py-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm font-bold hover:bg-yellow-500/30 transition-all disabled:opacity-50"
               >
                  {loading === 'all-in' ? '...' : 'All In'}
               </motion.button>
            </div>

            {/* Chips remaining */}
            <p className="text-center text-white/25 text-[10px]">
               Your stack:{' '}
               <span className="text-white/50 font-bold">
                  {player?.chips.toLocaleString()} chips
               </span>
            </p>
         </div>
      </motion.div>
   );
}
