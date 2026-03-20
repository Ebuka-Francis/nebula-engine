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

export default function PayoutsTab({ tournament }: { tournament: Tournament }) {
   return (
      <div>
         <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b border-white/[0.05]">
            {['PLACE', 'SHARE', 'AMOUNT'].map((h) => (
               <span
                  key={h}
                  className="text-[10px] font-semibold text-white/25 uppercase tracking-widest"
               >
                  {h}
               </span>
            ))}
         </div>
         {tournament.payoutStructure?.map((pct, i) => (
            <motion.div
               key={i}
               custom={i}
               variants={rowVariants}
               initial="hidden"
               animate="visible"
               className={`grid grid-cols-3 gap-2 items-center px-5 py-3.5 border-b border-white/[0.03] last:border-0 ${
                  i === 0 ? 'bg-yellow-400/[0.03]' : ''
               }`}
            >
               <span
                  className={`text-sm font-semibold ${
                     i === 0
                        ? 'text-yellow-400'
                        : i === 1
                          ? 'text-slate-300'
                          : i === 2
                            ? 'text-orange-400'
                            : 'text-white/50'
                  }`}
               >
                  {i === 0
                     ? '🥇 1st'
                     : i === 1
                       ? '🥈 2nd'
                       : i === 2
                         ? '🥉 3rd'
                         : `${i + 1}th`}{' '}
                  Place
               </span>
               <span className="text-white/40 text-sm">{pct}%</span>
               <span
                  className={`text-sm font-bold ${i === 0 ? 'text-yellow-400' : 'text-purple-400'}`}
               >
                  {((tournament.prizePool * pct) / 100).toLocaleString()} USDC
               </span>
            </motion.div>
         ))}
         <p className="text-[10px] text-white/20 px-5 py-3">
            Payouts are automated via Rain Protocol escrow.
         </p>
      </div>
   );
}
