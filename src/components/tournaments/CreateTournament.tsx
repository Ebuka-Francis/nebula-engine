'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
   ArrowLeft,
   Trophy,
   Settings,
   Brain,
   Coins,
   Rocket,
   ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

const sectionVariants: Variants = {
   hidden: { opacity: 0, y: 32 },
   visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
   }),
};

function SectionCard({
   icon: Icon,
   title,
   index,
   children,
}: {
   icon: any;
   title: string;
   index: number;
   children: React.ReactNode;
}) {
   return (
      <motion.div
         custom={index}
         variants={sectionVariants}
         initial="hidden"
         animate="visible"
         className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden"
      >
         {/* Section header */}
         <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.05]">
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
               <Icon size={14} className="text-purple-400" />
            </div>
            <h2 className="text-white font-bold text-sm tracking-tight">
               {title}
            </h2>
         </div>
         <div className="p-5">{children}</div>
      </motion.div>
   );
}

function InputField({
   label,
   placeholder,
   type = 'text',
   value,
   onChange,
}: {
   label: string;
   placeholder?: string;
   type?: string;
   value: string;
   onChange: (v: string) => void;
}) {
   return (
      <div className="flex flex-col gap-1.5">
         <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
            {label}
         </label>
         <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#0d0d0f] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 focus:bg-purple-500/[0.03] transition-all duration-200"
         />
      </div>
   );
}

function SelectField({
   label,
   options,
   value,
   onChange,
}: {
   label: string;
   options: string[];
   value: string;
   onChange: (v: string) => void;
}) {
   return (
      <div className="flex flex-col gap-1.5">
         <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
            {label}
         </label>
         <div className="relative">
            <select
               value={value}
               onChange={(e) => onChange(e.target.value)}
               className="w-full appearance-none bg-[#0d0d0f] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/60 transition-all duration-200 cursor-pointer"
            >
               {options.map((o) => (
                  <option key={o} value={o} className="bg-[#111114]">
                     {o}
                  </option>
               ))}
            </select>
            <ChevronDown
               size={14}
               className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
         </div>
      </div>
   );
}

const payoutRows = [
   { place: '1st Place', pct: '50%' },
   { place: '2nd Place', pct: '30%' },
   { place: '3rd Place', pct: '12.5%' },
   { place: '4th–8th Place', pct: '12.5% (split)' },
];

export default function CreateTournamentPage() {
   const [name, setName] = useState('');
   const [entry, setEntry] = useState('50');
   const [maxPlayers, setMaxPlayers] = useState('100');
   const [gameType, setGameType] = useState("Texas Hold'em");
   const [blindDuration, setBlindDuration] = useState('15 minutes');
   const [startingStack, setStartingStack] = useState('10,000 chips');
   const [predictions, setPredictions] = useState(true);

   return (
      <div className="min-h-screen bg-[#0d0d0f] px-4 md:px-8 py-10 font-sans">
         {/* Bg glow */}
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-700/8 blur-[120px] rounded-full pointer-events-none z-0" />

         <div className="relative z-10 max-w-2xl mx-auto">
            {/* Back link */}
            <motion.div
               initial={{ opacity: 0, x: -16 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.4 }}
            >
               <Link
                  href="/tournament"
                  className="inline-flex items-center gap-1.5 text-white/30 text-xs font-medium hover:text-purple-400 transition-colors duration-200 mb-6"
               >
                  <ArrowLeft size={13} />
                  Back to Tournaments
               </Link>
            </motion.div>

            {/* Page heading */}
            <motion.div
               initial={{ opacity: 0, y: -16 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.45 }}
               className="mb-8"
            >
               <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
                  Create{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                     Tournament
                  </span>
               </h1>
               <p className="text-[#6b6b80] text-sm">
                  Set up your tokenized poker tournament in minutes.
               </p>
            </motion.div>

            <div className="flex flex-col gap-4">
               {/* Tournament Details */}
               <SectionCard icon={Trophy} title="Tournament Details" index={1}>
                  <div className="flex flex-col gap-4">
                     <InputField
                        label="Tournament Name"
                        placeholder="e.g., Nebula Grand Prix"
                        value={name}
                        onChange={setName}
                     />
                     <div className="grid grid-cols-2 gap-3">
                        <InputField
                           label="Entry Fee (USDC)"
                           type="number"
                           value={entry}
                           onChange={setEntry}
                        />
                        <InputField
                           label="Max Players"
                           type="number"
                           value={maxPlayers}
                           onChange={setMaxPlayers}
                        />
                     </div>
                  </div>
               </SectionCard>

               {/* Game Settings */}
               <SectionCard icon={Settings} title="Game Settings" index={2}>
                  <div className="flex flex-col gap-4">
                     <div className="grid grid-cols-2 gap-3">
                        <SelectField
                           label="Game Type"
                           options={["Texas Hold'em", 'Omaha', 'Short Deck']}
                           value={gameType}
                           onChange={setGameType}
                        />
                        <SelectField
                           label="Blind Duration"
                           options={[
                              '5 minutes',
                              '10 minutes',
                              '15 minutes',
                              '20 minutes',
                           ]}
                           value={blindDuration}
                           onChange={setBlindDuration}
                        />
                     </div>
                     <SelectField
                        label="Starting Stack"
                        options={[
                           '5,000 chips',
                           '10,000 chips',
                           '20,000 chips',
                           '50,000 chips',
                        ]}
                        value={startingStack}
                        onChange={setStartingStack}
                     />
                  </div>
               </SectionCard>

               {/* Player Predictions */}
               <SectionCard icon={Brain} title="Player Predictions" index={3}>
                  <div className="flex items-center justify-between gap-4">
                     <p className="text-[#6b6b80] text-xs leading-relaxed max-w-sm">
                        Allow players and spectators to place side bets
                        predicting who finishes 1st, 2nd, or 3rd.
                     </p>
                     {/* Toggle */}
                     <button
                        onClick={() => setPredictions(!predictions)}
                        className={`relative shrink-0 w-11 h-6 rounded-full transition-all duration-300 ${
                           predictions
                              ? 'bg-gradient-to-r from-violet-600 to-purple-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                              : 'bg-white/10'
                        }`}
                     >
                        <motion.div
                           animate={{ x: predictions ? 20 : 2 }}
                           transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 30,
                           }}
                           className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                        />
                     </button>
                  </div>
               </SectionCard>

               {/* Payout Structure */}
               <SectionCard icon={Coins} title="Payout Structure" index={4}>
                  <div className="flex flex-col gap-1">
                     {payoutRows.map((row, i) => (
                        <div
                           key={row.place}
                           className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${
                              i === 0
                                 ? 'bg-purple-500/10 border border-purple-500/20'
                                 : 'hover:bg-white/[0.02]'
                           } transition-colors duration-200`}
                        >
                           <span
                              className={`text-sm font-medium ${
                                 i === 0 ? 'text-purple-300' : 'text-white/50'
                              }`}
                           >
                              {row.place}
                           </span>
                           <span
                              className={`text-sm font-bold ${
                                 i === 0 ? 'text-purple-300' : 'text-white/40'
                              }`}
                           >
                              {row.pct}
                           </span>
                        </div>
                     ))}
                     <p className="text-[10px] text-white/20 mt-2 px-1">
                        Payouts are automated via Rain Protocol escrow.
                     </p>
                  </div>
               </SectionCard>

               {/* Launch Button */}
               <motion.div
                  custom={5}
                  variants={sectionVariants}
                  initial="hidden"
                  animate="visible"
               >
                  <motion.button
                     whileHover={{
                        scale: 1.02,
                        boxShadow: '0 0 40px rgba(139,92,246,0.65)',
                     }}
                     whileTap={{ scale: 0.98 }}
                     className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm tracking-wide shadow-[0_0_24px_rgba(139,92,246,0.4)] transition-shadow duration-200"
                  >
                     <Rocket size={16} />
                     Launch Tournament
                  </motion.button>
               </motion.div>
            </div>
         </div>
      </div>
   );
}
