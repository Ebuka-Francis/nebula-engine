'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

const comicPanels = [
   {
      bg: 'from-purple-900/80 to-slate-900',
      content: (
         <div className="flex flex-col items-center justify-center h-full gap-2 p-3">
            <div className="text-4xl">🧑‍💻</div>
            <div className="bg-white rounded-xl rounded-bl-none px-3 py-1.5 text-[10px] font-bold text-gray-800 shadow-lg max-w-[120px] text-center leading-tight">
               I want to run a tournament...
            </div>
         </div>
      ),
   },
   {
      bg: 'from-violet-900/80 to-slate-900',
      content: (
         <div className="flex flex-col items-center justify-center h-full gap-2 p-3 relative">
            {/* Speed lines */}
            {[...Array(8)].map((_, i) => (
               <div
                  key={i}
                  className="absolute bg-purple-400/20"
                  style={{
                     width: '1px',
                     height: '100%',
                     left: `${10 + i * 12}%`,
                     transform: `rotate(${-10 + i * 3}deg)`,
                     transformOrigin: 'center',
                  }}
               />
            ))}
            <div className="text-4xl z-10">⚡</div>
            <div className="bg-purple-500 rounded-xl px-3 py-1.5 text-[10px] font-black text-white shadow-lg z-10 tracking-wide uppercase">
               NEBULA ENGINE
            </div>
         </div>
      ),
   },
   {
      bg: 'from-cyan-900/60 to-slate-900',
      content: (
         <div className="flex flex-col items-center justify-center h-full gap-2 p-3">
            <div className="text-4xl">🏆</div>
            <div className="bg-white rounded-xl rounded-br-none px-3 py-1.5 text-[10px] font-bold text-gray-800 shadow-lg max-w-[120px] text-center leading-tight">
               Auto payouts. No code!
            </div>
         </div>
      ),
   },
   {
      bg: 'from-purple-800/60 to-cyan-900/60',
      content: (
         <div className="flex flex-col items-center justify-center h-full gap-1 p-3">
            <div className="text-3xl">🎮</div>
            <div
               className="text-yellow-300 font-black text-lg tracking-widest"
               style={{ textShadow: '0 0 10px #facc15, 0 0 20px #facc15' }}
            >
               LET'S GO!
            </div>
            {/* Burst lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               {[...Array(10)].map((_, i) => (
                  <div
                     key={i}
                     className="absolute bg-yellow-400/30"
                     style={{
                        width: '60px',
                        height: '2px',
                        transform: `rotate(${i * 36}deg)`,
                        transformOrigin: '0 50%',
                        left: '50%',
                     }}
                  />
               ))}
            </div>
         </div>
      ),
   },
];

const sectionVariants: Variants = {
   hidden: { opacity: 0, y: 40 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
   },
};

const textVariants: Variants = {
   hidden: { opacity: 0, y: 20 },
   visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.15, ease: 'easeOut' },
   }),
};

const panelVariants: Variants = {
   hidden: { opacity: 0, scale: 0.85, rotate: -3 },
   visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 0.5, delay: 0.3 + i * 0.12, ease: 'easeOut' },
   }),
};

export default function CTASection() {
   return (
      <section className="relative bg-[#0d0d0f] px-4 py-16 md:py-20 overflow-hidden font-sans">
         {/* Bg glow */}
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-purple-700/10 blur-[100px] rounded-full" />
         </div>

         <motion.div
            className="relative z-10 max-w-5xl mx-auto rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#13131a] to-[#0f0f18] overflow-hidden shadow-2xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
         >
            <div className="flex flex-col lg:flex-row items-center gap-0">
               {/* Left — Text */}
               <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left px-8 py-12 md:px-12">
                  <motion.h2
                     custom={0}
                     variants={textVariants}
                     initial="hidden"
                     whileInView="visible"
                     viewport={{ once: true }}
                     className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight"
                     style={{ fontFamily: "'Orbitron', 'Sora', sans-serif" }}
                  >
                     Ready to <br />
                     <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        compete?
                     </span>
                  </motion.h2>

                  <motion.p
                     custom={1}
                     variants={textVariants}
                     initial="hidden"
                     whileInView="visible"
                     viewport={{ once: true }}
                     className="text-[#8b8b9e] text-sm md:text-base max-w-sm leading-relaxed mb-8"
                  >
                     Connect your wallet and join the next generation of
                     decentralized tournaments.
                  </motion.p>

                  <Link href="/tournament">
                     <motion.button
                        custom={2}
                        variants={textVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        whileHover={{
                           scale: 1.05,
                           boxShadow: '0 0 40px rgba(139,92,246,0.7)',
                        }}
                        whileTap={{ scale: 0.97 }}
                        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm tracking-wide shadow-[0_0_24px_rgba(139,92,246,0.4)] transition-shadow duration-200"
                     >
                        Get Started →
                     </motion.button>
                  </Link>
               </div>

               {/* Right — Comic Panels */}
               <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
                  <div className="grid grid-cols-2 gap-2 w-full max-w-[280px]">
                     {comicPanels.map((panel, i) => (
                        <motion.div
                           key={i}
                           custom={i}
                           variants={panelVariants}
                           initial="hidden"
                           whileInView="visible"
                           viewport={{ once: true }}
                           whileHover={{
                              scale: 1.06,
                              zIndex: 10,
                              transition: { duration: 0.2 },
                           }}
                           className={`relative h-[120px] rounded-xl bg-gradient-to-br ${panel.bg} border-2 border-white/10 overflow-hidden cursor-pointer shadow-lg`}
                           style={{
                              boxShadow:
                                 'inset 0 0 0 2px rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.4)',
                           }}
                        >
                           {/* Comic dot pattern overlay */}
                           <div
                              className="absolute inset-0 opacity-10 pointer-events-none"
                              style={{
                                 backgroundImage:
                                    'radial-gradient(circle, white 1px, transparent 1px)',
                                 backgroundSize: '8px 8px',
                              }}
                           />
                           {/* Panel number */}
                           <div className="absolute top-1.5 left-2 text-[9px] font-black text-white/30 tracking-widest">
                              {String(i + 1).padStart(2, '0')}
                           </div>
                           {panel.content}
                        </motion.div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Bottom shimmer line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
         </motion.div>
      </section>
   );
}
