'use client';

import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

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
   const { user, logout } = useAuth();

   const handleLogout = async () => {
      try {
         await logout();
      } catch (error) {
         console.error('Logout failed:', error);
      }
   };

   return (
      <footer className="relative overflow-hidden border-t border-white/[0.06] bg-[#0d0d0f] font-sans">
         {/* Scrolling Marquee */}
         <div className="overflow-hidden border-b border-white/[0.04] py-2.5">
            <motion.div
               className="flex gap-12 whitespace-nowrap"
               animate={{ x: ['0%', '-50%'] }}
               transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: 'linear',
               }}
            >
               {marqueeItems.map((item, i) => (
                  <span
                     key={i}
                     className="shrink-0 text-[11px] font-medium uppercase tracking-widest text-white/20"
                  >
                     {item}
                  </span>
               ))}
            </motion.div>
         </div>

         {/* Main Footer Row */}
         <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-5 sm:flex-row">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
               <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
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

                  <div className="absolute inset-[2px] z-10 flex items-center justify-center rounded-[8px] bg-gradient-to-br from-violet-600 to-purple-700">
                <Image src="/nebula-logo-removebg-preview.png" alt="Logo" width={40} height={40} />
                  </div>
               </div>

               <span className="text-sm font-bold uppercase tracking-[0.1em] text-white">
                  Nebula Engine
               </span>
            </div>

            {/* Copyright + Logout */}
            <div className="flex items-center gap-5">
               <motion.p
                  className="text-xs tracking-wide text-[#4a4a5e]"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
               >
                  © 2026 Nebula Engine. Built on{' '}
                  <span className="cursor-pointer text-purple-500/70 transition-colors duration-200 hover:text-purple-400">
                     Rain Protocol
                  </span>
               </motion.p>

               {/* Logout Button */}
               {user && (
                  <button
                     type="button"
                     onClick={handleLogout}
                     title="Log out"
                     className="group flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/[0.04] text-red-400/60 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 hover:shadow-[0_0_18px_rgba(239,68,68,0.15)] cursor-pointer"
                  >
                     <LogOut
                        size={16}
                        className="transition-transform duration-200 group-hover:-translate-x-0.5"
                     />
                  </button>
               )}
            </div>
         </div>

         {/* Bottom shimmer */}
         <motion.div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
               background:
                  'linear-gradient(90deg, transparent, #7c3aed, #22d3ee, #7c3aed, transparent)',
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
               duration: 3,
               repeat: Infinity,
               ease: 'easeInOut',
            }}
         />
      </footer>
   );
}