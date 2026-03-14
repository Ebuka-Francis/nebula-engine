'use client';

import { motion } from 'framer-motion';

const marqueeItems = [
   '⚡ Trustless Tournaments',
   '🏆 Auto Payouts',
   '🔐 On-chain Escrow',
   '🎮 Decentralized Gaming',
   '💜 Powered by Rain Protocol',
   '🌌 Nebula Engine',
   '⚡ Trustless Tournaments',
   '🏆 Auto Payouts',
   '🔐 On-chain Escrow',
   '🎮 Decentralized Gaming',
   '💜 Powered by Rain Protocol',
   '🌌 Nebula Engine',
];

export default function Footer() {
   return (
      <footer className="relative bg-[#0d0d0f] border-t border-white/[0.06] overflow-hidden font-sans">
         {/* Scrolling Marquee */}
         <div className="border-b border-white/[0.04] py-2.5 overflow-hidden">
            <motion.div
               className="flex gap-12 whitespace-nowrap"
               animate={{ x: ['0%', '-50%'] }}
               transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            >
               {marqueeItems.map((item, i) => (
                  <span
                     key={i}
                     className="text-[11px] font-medium text-white/20 tracking-widest uppercase shrink-0"
                  >
                     {item}
                  </span>
               ))}
            </motion.div>
         </div>

         {/* Main Footer Row */}
         <div className="relative z-10 max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
               {/* Rotating glow ring */}
               <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                  <motion.div
                     className="absolute inset-0 rounded-xl"
                     style={{
                        background:
                           'conic-gradient(from 0deg, #7c3aed, #22d3ee, #a855f7, #7c3aed)',
                        padding: '1.5px',
                        borderRadius: '10px',
                     }}
                     animate={{ rotate: 360 }}
                     transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'linear',
                     }}
                  />
                  <div className="absolute inset-[2px] rounded-[8px] bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center z-10">
                     <span className="text-white font-black text-sm">N</span>
                  </div>
               </div>

               <span className="text-white font-bold text-sm tracking-[0.1em] uppercase">
                  Nebula Engine
               </span>
            </div>

            {/* Copyright */}
            <motion.p
               className="text-[#4a4a5e] text-xs tracking-wide"
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 1, delay: 0.3 }}
            >
               © 2026 Nebula Engine. Built on{' '}
               <span className="text-purple-500/70 hover:text-purple-400 transition-colors duration-200 cursor-pointer">
                  Rain Protocol
               </span>
               .
            </motion.p>
         </div>

         {/* Bottom shimmer */}
         <motion.div
            className="absolute bottom-0 left-0 right-0 h-[1px]"
            style={{
               background:
                  'linear-gradient(90deg, transparent, #7c3aed, #22d3ee, #7c3aed, transparent)',
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
         />
      </footer>
   );
}
