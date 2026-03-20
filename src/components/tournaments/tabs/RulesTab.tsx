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

const rules = [
   "Texas Hold'em – No Limit format.",
   'Blind levels increase every 15 minutes.',
   'Starting stack: 10,000 chips per player.',
   'Late registration closes after Level 4.',
   'All-in situations are resolved on-chain via Rain Protocol.',
   'Players disconnecting for 3+ minutes are auto-folded.',
   'Prize payouts are automated — no manual claims needed.',
];

export default function RulesTab({ tournament }: { tournament: Tournament }) {
   return (
      <div className="p-5 flex flex-col gap-3">
         <div className="flex flex-col gap-1 mb-2">
            {[
               { label: 'Blind Duration', value: tournament.blindDuration },
               {
                  label: 'Starting Stack',
                  value: `${tournament.startingStack.toLocaleString()} chips`,
               },
               { label: 'Game Type', value: tournament.type },
            ].map((item) => (
               <div
                  key={item.label}
                  className="flex justify-between text-xs text-white/30 px-1"
               >
                  <span>{item.label}</span>
                  <span className="text-white/60 font-medium">
                     {item.value}
                  </span>
               </div>
            ))}
         </div>
         <div className="border-t border-white/[0.05] pt-4 flex flex-col gap-3">
            {rules.map((rule, i) => (
               <motion.div
                  key={i}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex items-start gap-3"
               >
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-[10px] font-black text-purple-400 shrink-0">
                     {i + 1}
                  </span>
                  <p className="text-white/60 text-sm leading-relaxed">
                     {rule}
                  </p>
               </motion.div>
            ))}
         </div>
      </div>
   );
}
