'use client';

import { motion, Variants } from 'framer-motion';
import { Tournament } from '../../../../types';
import { Coins, Trophy } from 'lucide-react';

const rowVariants: Variants = {
   hidden: { opacity: 0, x: -24 },
   visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: i * 0.06, ease: 'easeOut' },
   }),
};

const PLACE_META: Record<
   number,
   { emoji: string; label: string; color: string; bg: string }
> = {
   0: {
      emoji: '🥇',
      label: '1st',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/[0.04]',
   },
   1: {
      emoji: '🥈',
      label: '2nd',
      color: 'text-slate-300',
      bg: '',
   },
   2: {
      emoji: '🥉',
      label: '3rd',
      color: 'text-amber-600',
      bg: '',
   },
};

function placeSuffix(i: number) {
   const n = i + 1;
   if (n === 1) return '1st';
   if (n === 2) return '2nd';
   if (n === 3) return '3rd';
   return `${n}th`;
}

export default function PayoutsTab({ tournament }: { tournament: Tournament }) {
   const { prizePool, payoutStructure, entryFee, currentPlayers } = tournament;
   const hasPayouts = payoutStructure && payoutStructure.length > 0;
   const totalPct = payoutStructure?.reduce((a, b) => a + b, 0) ?? 0;
   const projectedPool =
      prizePool > 0 ? prizePool : entryFee * (currentPlayers ?? 0);

   return (
      <div>
         {/* Summary banner */}
         <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/[0.05] bg-white/[0.01]">
            <div className="flex items-center gap-2.5">
               <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Coins size={14} className="text-purple-400" />
               </div>
               <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
                     Total Prize Pool
                  </p>
                  <p className="text-white font-black text-lg leading-tight">
                     {projectedPool > 0
                        ? `${projectedPool.toLocaleString()} USDC`
                        : 'TBD'}
                  </p>
               </div>
            </div>

            {entryFee > 0 && (
               <div className="text-right">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
                     Entry Fee
                  </p>
                  <p className="text-white/70 font-bold text-sm">
                     {entryFee} USDC
                  </p>
               </div>
            )}
         </div>

         {/* Column headers */}
         <div className="grid grid-cols-[1fr_80px_130px] gap-2 px-5 py-3 border-b border-white/[0.05]">
            {['PLACE', 'SHARE', 'AMOUNT'].map((h) => (
               <span
                  key={h}
                  className="text-[10px] font-semibold text-white/25 uppercase tracking-widest"
               >
                  {h}
               </span>
            ))}
         </div>

         {/* Rows */}
         {!hasPayouts ? (
            <div className="py-14 flex flex-col items-center gap-3 text-center">
               <Trophy size={28} className="text-white/10" />
               <p className="text-white/20 text-xs">
                  No payout structure defined yet.
               </p>
            </div>
         ) : (
            <>
               <div className="divide-y divide-white/[0.03]">
                  {payoutStructure!.map((pct, i) => {
                     const meta = PLACE_META[i];
                     const amount = (projectedPool * pct) / 100;

                     return (
                        <motion.div
                           key={i}
                           custom={i}
                           variants={rowVariants}
                           initial="hidden"
                           animate="visible"
                           className={`grid grid-cols-[1fr_80px_130px] gap-2 items-center px-5 py-3.5 transition-colors hover:bg-white/[0.02] ${meta?.bg ?? ''}`}
                        >
                           {/* Place */}
                           <span
                              className={`text-sm font-semibold flex items-center gap-1.5 ${meta?.color ?? 'text-white/40'}`}
                           >
                              <span>{meta?.emoji ?? '🏅'}</span>
                              <span>{placeSuffix(i)} Place</span>
                           </span>

                           {/* Share */}
                           <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden max-w-[40px]">
                                 <div
                                    className={`h-full rounded-full ${i === 0 ? 'bg-yellow-400' : 'bg-purple-500'}`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                 />
                              </div>
                              <span className="text-white/40 text-sm tabular-nums">
                                 {pct}%
                              </span>
                           </div>

                           {/* Amount */}
                           <span
                              className={`text-sm font-bold tabular-nums ${
                                 i === 0 ? 'text-yellow-400' : 'text-purple-400'
                              }`}
                           >
                              {projectedPool > 0
                                 ? `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`
                                 : '—'}
                           </span>
                        </motion.div>
                     );
                  })}
               </div>

               {/* Totals row */}
               <div className="grid grid-cols-[1fr_80px_130px] gap-2 items-center px-5 py-3 border-t border-white/[0.07] bg-white/[0.01]">
                  <span className="text-[10px] text-white/20 font-semibold uppercase tracking-widest">
                     Total
                  </span>
                  <span
                     className={`text-xs font-bold tabular-nums ${totalPct === 100 ? 'text-emerald-400' : 'text-red-400'}`}
                  >
                     {totalPct}%
                  </span>
                  <span className="text-xs font-bold text-white/30 tabular-nums">
                     {projectedPool > 0
                        ? `${projectedPool.toLocaleString()} USDC`
                        : '—'}
                  </span>
               </div>
            </>
         )}

         {/* Footer */}
         <div className="px-5 py-3 border-t border-white/[0.05]">
            <p className="text-[10px] text-white/20 text-center">
               Payouts are automated via Rain Protocol escrow on Base network.
            </p>
         </div>
      </div>
   );
}
