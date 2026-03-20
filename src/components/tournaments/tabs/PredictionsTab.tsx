'use client';

import { motion, Variants } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Tournament } from '../../../../types';
import { useAccount } from 'wagmi';

const rowVariants: Variants = {
   hidden: { opacity: 0, x: -24 },
   visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' },
   }),
};

const markets = [
   {
      label: '🥇 1st Place Winner',
      multiplier: '2.1x',
      color: 'text-yellow-400',
      border: 'border-yellow-400/20',
      bg: 'bg-yellow-400/5',
   },
   {
      label: '🥈 2nd Place',
      multiplier: '3.4x',
      color: 'text-slate-300',
      border: 'border-slate-400/20',
      bg: 'bg-slate-400/5',
   },
   {
      label: '🥉 3rd Place',
      multiplier: '5.0x',
      color: 'text-orange-400',
      border: 'border-orange-400/20',
      bg: 'bg-orange-400/5',
   },
   {
      label: '⚔️ First Elimination',
      multiplier: '1.8x',
      color: 'text-red-400',
      border: 'border-red-400/20',
      bg: 'bg-red-400/5',
   },
];

export default function PredictionsTab({
   tournament,
}: {
   tournament: Tournament;
}) {
   const { isConnected } = useAccount();

   if (!tournament.sideBetting) {
      return (
         <div className="text-center py-8 text-white/20 text-xs">
            Side betting is not enabled for this tournament.
         </div>
      );
   }

   return (
      <div className="p-5 flex flex-col gap-4">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-white font-bold text-sm">
                  Place Your Predictions
               </h3>
               <p className="text-white/30 text-xs mt-0.5">
                  Predict who finishes 1st, 2nd or 3rd before the tournament
                  ends.
               </p>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-semibold">
               <Zap size={10} />
               Open
            </span>
         </div>

         {/* No players yet */}
         {tournament.currentPlayers === 0 ? (
            <div className="text-center py-8 text-white/20 text-xs">
               No players have joined yet. Predictions open once players join.
            </div>
         ) : (
            <div className="flex flex-col gap-3">
               {markets.map((market, i) => (
                  <motion.div
                     key={market.label}
                     custom={i}
                     variants={rowVariants}
                     initial="hidden"
                     animate="visible"
                     className={`flex items-center justify-between gap-4 p-4 rounded-xl border ${market.border} ${market.bg}`}
                  >
                     <div className="flex flex-col gap-1">
                        <span className="text-white text-sm font-semibold">
                           {market.label}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className="text-white/30 text-[10px]">
                              Multiplier:
                           </span>
                           <span
                              className={`text-sm font-black ${market.color}`}
                           >
                              {market.multiplier}
                           </span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 shrink-0">
                        <input
                           type="number"
                           placeholder="USDC"
                           min="1"
                           className="w-20 bg-black/30 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-all duration-200"
                        />
                        <motion.button
                           whileHover={{ scale: 1.04 }}
                           whileTap={{ scale: 0.97 }}
                           onClick={() => {
                              if (!isConnected) {
                                 alert(
                                    'Please connect your wallet to place a bet.',
                                 );
                                 return;
                              }
                              alert(
                                 'Prediction betting coming soon via Rain Protocol!',
                              );
                           }}
                           className="px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors duration-200 cursor-pointer whitespace-nowrap"
                        >
                           Place Bet
                        </motion.button>
                     </div>
                  </motion.div>
               ))}
               <p className="text-[10px] text-white/20 text-center mt-1">
                  Predictions powered by Rain Protocol. Payouts are automatic.
               </p>
            </div>
         )}
      </div>
   );
}
