'use client';

import { motion, Variants } from 'framer-motion';
import { Zap, Shield, Trophy, Clock } from 'lucide-react';

const features = [
   {
      icon: Zap,
      title: 'Instant Setup',
      description:
         'Create tokenized tournaments in minutes. No coding required.',
   },
   {
      icon: Shield,
      title: 'Trustless & Secure',
      description:
         'Rain Protocol handles escrow, staking, and automated payouts.',
   },
   {
      icon: Trophy,
      title: 'Real-time Leaderboards',
      description: 'Track rankings live with transparent, on-chain scoring.',
   },
   {
      icon: Clock,
      title: 'Auto Payouts',
      description:
         'Winners receive rewards automatically. No disputes, no delays.',
   },
];

const containerVariants = {
   hidden: {},
   visible: {
      transition: {
         staggerChildren: 0.15,
      },
   },
};

const cardVariants: Variants = {
   hidden: { opacity: 0, y: 60 },
   visible: {
      opacity: 1,
      y: 0,
      transition: {
         duration: 0.6,
         ease: 'easeOut', // 👈 changed
      },
   },
};

const headingVariants: Variants = {
   hidden: { opacity: 0, y: 30 },
   visible: {
      opacity: 1,
      y: 0,
      transition: {
         duration: 0.6,
         ease: 'easeOut', // 👈 changed
      },
   },
};

export default function WhySection() {
   return (
      <section className="relative bg-[#0d0d0f] px-6 py-20 md:py-20 overflow-hidden font-sans">
         {/* Subtle bg glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

         <div className="relative z-10 max-w-6xl mx-auto">
            {/* Heading */}
            <motion.div
               className="text-center mb-16"
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.5 }}
               variants={headingVariants}
            >
               <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                  Why{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                     Nebula Engine
                  </span>
                  ?
               </h2>
               <p className="text-[#8b8b9e] text-sm md:text-base max-w-md mx-auto leading-relaxed">
                  No custody. No disputes. No manual payouts. Just pure,
                  automated competition.
               </p>
            </motion.div>

            {/* Cards */}
            <motion.div
               className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, amount: 0.2 }}
               variants={containerVariants}
            >
               {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                     <motion.div
                        key={feature.title}
                        variants={cardVariants}
                        whileHover={{ y: -6, transition: { duration: 0.25 } }}
                        className="group relative flex flex-col gap-5 p-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm hover:border-purple-500/40 hover:bg-purple-500/5 transition-colors duration-300 cursor-pointer"
                     >
                        {/* Hover glow */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.08),transparent_60%)] pointer-events-none" />

                        {/* Icon */}
                        <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/25 transition-colors duration-300">
                           <Icon size={20} className="text-purple-400" />
                        </div>

                        {/* Text */}
                        <div className="flex flex-col gap-2">
                           <h3 className="text-white font-bold text-base tracking-tight">
                              {feature.title}
                           </h3>
                           <p className="text-[#8b8b9e] text-sm leading-relaxed">
                              {feature.description}
                           </p>
                        </div>
                     </motion.div>
                  );
               })}
            </motion.div>
         </div>
      </section>
   );
}
