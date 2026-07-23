'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from "next/image";
import TopNav from '../top-nav/TopNav';

export default function HeroSection() {
   const [showLaunchModal, setShowLaunchModal] = useState(false);

   const stats = [
      { value: '24,568', label: 'PLAYERS', color: 'text-white' },
      { value: '1,245', label: 'TOURNAMENTS', color: 'text-purple-500' },
      { value: '$2.45M', label: 'PRIZE POOL', color: 'text-cyan-400' },
      { value: '12,345', label: 'PREDICTIONS', color: 'text-purple-500' },
   ];

   return (
      <section className="relative min-h-screen bg-[#08080d] flex flex-col justify-center px-6 md:px-16  pt-28 pb-7 md:py-20 font-sans overflow-hidden">
         
         {/* Optimized Background Image Container */}
         <div className="absolute inset-0 z-0">
            <Image
               src="/nebula-heroimage.png" 
               alt="Nebula background"
               fill
               priority
               quality={90}
               className="object-cover object-right md:object-center"
            />
            {/* Dark gradient overlay adapted for responsiveness (stronger on mobile, subtle on desktop) */}
            <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-[#08080d]/95 via-[#08080d]/85 to-[#08080d]/40 md:to-[#08080d]/20" />
         </div>

         {/* TopNav */}
         <div className="absolute top-0 left-0 right-0 z-10 w-full">
            <TopNav />
         </div>

         {/* 
           Clean Flexbox Container 
           - Uses 'justify-start' to cleanly pull content to the left side on desktop.
         */}
         <div className="relative w-full max-w-7xl mx-auto flex items-center justify-start">
            
            {/* 
              Content Wrapper
              - 'w-full' on mobile ensures content utilizes the available space.
              - 'lg:w-1/2' on desktop locks it to the left half, naturally exposing your background.
            */}
            <div className="w-full lg:w-1/2 max-w-2xl text-left flex flex-col justify-center">
               
               <h1 className="hero-title fade-in-up text-[40px] sm:text-[52px] lg:text-[64px] font-extrabold leading-[1.05] tracking-tight text-white mb-6">
                  <span className="block">COMPETE.</span>
                  <span className="block">PREDICT.</span>
                  <span className="block">EARN.</span>
               </h1>

               <p className="hero-subtitle fade-in-up text-zinc-400 text-sm sm:text-base max-w-md leading-relaxed font-normal mb-8 [animation-delay:0.1s]">
                  The all-in-one Web3 platform for poker tournaments, prediction markets and bounty competitions.
               </p>

               {/* CTA Buttons */}
               <div className="hero-buttons fade-in-up flex flex-col sm:flex-row gap-4 mb-12 sm:mb-16 [animation-delay:0.2s]">
                  <button
                     onClick={() => setShowLaunchModal(true)}
                     className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-purple-500 hover:opacity-90 rounded-xl text-white text-sm font-semibold shadow-[0_0_24px_rgba(139,92,246,0.4)] hover:shadow-[0_0_34px_rgba(139,92,246,0.6)] transition-all duration-200 text-center"
                  >
                     Start Playing
                  </button>

                  <Link
                     href="/tournament"
                     className="px-8 py-3.5 bg-transparent border border-white/15 hover:border-white/40 hover:bg-white/[0.04] rounded-xl text-zinc-200 text-sm font-semibold transition-all duration-200 text-center"
                  >
                     Explore Tournaments
                  </Link>
               </div>

               {/* Stats Grid */}
               <div className="hero-stats fade-in-up grid grid-cols-2 sm:flex sm:flex-wrap gap-x-8 gap-y-6 sm:gap-12 [animation-delay:0.3s]">
                  {stats.map((stat) => (
                     <div key={stat.label} className="flex flex-col gap-1">
                        <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${stat.color}`}>
                           {stat.value}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 tracking-widest uppercase">
                           {stat.label}
                        </span>
                     </div>
                  ))}
               </div>
            </div>

         </div>

         {/* Launch Tournament Modal */}
         {showLaunchModal && (
            <div
               onClick={() => setShowLaunchModal(false)}
               className="fixed inset-0 z-50 bg-[#060509]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            >
               <div
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-[420px] p-6 sm:p-8 rounded-2xl border border-purple-500/35 bg-[#141218] shadow-[0_24px_64px_rgba(0,0,0,0.5)] animate-modal-in"
               >
                  <h3 className="text-white text-lg sm:text-xl font-bold mb-1">
                     Launch a Tournament
                  </h3>
                  <p className="text-zinc-500 text-xs sm:text-sm mb-6 leading-relaxed">
                     Set the terms — staking and payouts are handled automatically.
                  </p>

                  <div className="space-y-4 mb-6">
                     <div>
                        <label className="block text-purple-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                           Tournament name
                        </label>
                        <input
                           type="text"
                           placeholder="e.g. Sunday Deepstack"
                           className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-white text-sm focus:outline-none focus:border-purple-500/50 transition"
                        />
                     </div>

                     <div>
                        <label className="block text-purple-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                           Buy-in (SOL)
                        </label>
                        <input
                           type="text"
                           placeholder="0.5"
                           className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/[0.04] text-white text-sm focus:outline-none focus:border-purple-500/50 transition"
                        />
                     </div>
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={() => setShowLaunchModal(false)}
                        className="flex-1 py-3 border border-white/10 hover:border-white/20 bg-transparent text-zinc-400 hover:text-zinc-200 rounded-xl text-sm font-semibold transition"
                     >
                        Cancel
                     </button>
                     <button
                        className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition hover:opacity-95"
                     >
                        Create Tournament
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Animation Styles */}
         <style>{`
            @keyframes fadeInUp {
               from { opacity: 0; transform: translateY(14px); }
               to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeIn {
               from { opacity: 0; } to { opacity: 1; }
            }
            @keyframes modalIn {
               from { opacity: 0; transform: scale(0.96) translateY(8px); }
               to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .fade-in-up {
               opacity: 0;
               animation: fadeInUp 0.6s ease forwards;
            }
            .animate-fade-in {
               animation: fadeIn 0.2s ease;
            }
            .animate-modal-in {
               animation: modalIn 0.25s ease;
            }
            @media (prefers-reduced-motion: reduce) {
               .fade-in-up { animation: none !important; opacity: 1 !important; }
            }
         `}</style>
      </section>
   );
}