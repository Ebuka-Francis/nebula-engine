'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import {
   Wallet,
   ArrowLeft,
   Rocket,
   Trophy,
   Settings,
   Brain,
   Coins,
   ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { createTournament } from '@/lib/tournamentService';
import { auth } from '@/lib/firebase';
import { TournamentStatus } from '../../../types';
import { useEscrow } from '@/hooks/useEscrow';
import { useWalletSync } from '@/hooks/useWalletSync';
import UsernameModal from '../modals/UsernameModal';

export default function CreateTournamentPage() {
   const { address, isConnected } = useAccount();
   const router = useRouter();
   const { createTournamentOnChain } = useEscrow();
   const { needsUsername, setNeedsUsername } = useWalletSync();

   const [showUsernameModal, setShowUsernameModal] = useState(false);
   const [name, setName] = useState('');
   const [entry, setEntry] = useState('50');
   const [maxPlayers, setMaxPlayers] = useState('100');
   const [gameType, setGameType] = useState("Texas Hold'em");
   const [blindDuration, setBlindDuration] = useState('15 minutes');
   const [startingStack, setStartingStack] = useState('10,000 chips');
   const [predictions, setPredictions] = useState(true);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [prizePool, setPrizePool] = useState('5000');
   const [payoutPlaces, setPayoutPlaces] = useState<number[]>([50, 30, 20]);

   const totalPct = payoutPlaces.reduce((sum, p) => sum + Number(p), 0);

   const handlePlacesChange = (n: number) => {
      const equal = Math.floor(100 / n);
      const remainder = 100 - equal * n;
      const places = Array.from({ length: n }, (_, i) =>
         i === 0 ? equal + remainder : equal,
      );
      setPayoutPlaces(places);
   };

   const handlePayoutChange = (index: number, value: string) => {
      const updated = [...payoutPlaces];
      updated[index] = Number(value);
      setPayoutPlaces(updated);
   };

   // 🔒 Redirect if wallet not connected
   useEffect(() => {
      if (!isConnected) {
         router.replace('/tournament');
      }
   }, [isConnected, router]);

   const handleSubmit = async () => {
      if (!isConnected || !address) {
         setError('Please connect your wallet first.');
         return;
      }

      // ✅ Show modal if username is NOT set yet
      if (needsUsername) {
         setShowUsernameModal(true);
         return;
      }

      if (!name.trim()) {
         setError('Please enter a tournament name.');
         return;
      }
      if (totalPct !== 100) {
         setError('Payout percentages must add up to 100%.');
         return;
      }

      setLoading(true);
      setError('');

      try {
         const tournamentId = await createTournament({
            name,
            type: gameType,
            status: 'upcoming' as TournamentStatus,
            entryFee: Number(entry),
            prizePool: Number(prizePool),
            maxPlayers: Number(maxPlayers),
            startTime: Timestamp.fromDate(new Date()),
            creatorAddress: address.toLowerCase(),
            sideBetting: predictions,
            blindDuration,
            startingStack: Number(
               startingStack.replace(/,/g, '').split(' ')[0],
            ),
            payoutStructure: payoutPlaces,
         });

         router.push('/tournament');
      } catch (err: any) {
         console.error(err);
         setError(err.message ?? 'Something went wrong.');
      } finally {
         setLoading(false);
      }
   };

   // 🔒 Show nothing while redirecting (avoids flash of form)
   if (!isConnected) {
      return (
         <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#0d0d0f] px-4 md:px-8 py-10 font-sans">
         {showUsernameModal && address && (
            <UsernameModal
               address={address}
               onComplete={() => {
                  setNeedsUsername(false);
                  setShowUsernameModal(false);
                  // Auto-submit after username is set
                  handleSubmit();
               }}
               onClose={() => setShowUsernameModal(false)}
            />
         )}
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-700/8 blur-[120px] rounded-full pointer-events-none z-0" />

         <div className="relative z-10 max-w-2xl mx-auto">
            {/* Back */}
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

            {/* Heading */}
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
               {/* Wallet badge */}
               <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                  <Wallet size={12} className="text-purple-400" />
                  <span className="text-purple-300 text-xs font-mono">
                     {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
               </div>
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
                        {/* Entry Fee — 0 means free */}
                        <div className="flex flex-col gap-1.5">
                           <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                              Entry Fee (USDC)
                           </label>
                           <div className="relative">
                              <input
                                 type="number"
                                 min="0"
                                 value={entry}
                                 onChange={(e) => setEntry(e.target.value)}
                                 placeholder="0"
                                 className="w-full bg-[#0d0d0f] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 transition-all duration-200"
                              />
                              {Number(entry) === 0 && (
                                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                                    Free
                                 </span>
                              )}
                           </div>
                        </div>

                        <InputField
                           label="Max Players"
                           type="number"
                           value={maxPlayers}
                           onChange={setMaxPlayers}
                        />
                     </div>

                     {/* Manual prize pool input */}
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                           Prize Pool (USDC)
                        </label>
                        <input
                           type="number"
                           min="0"
                           value={prizePool}
                           onChange={(e) => setPrizePool(e.target.value)}
                           placeholder="e.g., 5000"
                           className="w-full bg-[#0d0d0f] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 transition-all duration-200"
                        />
                        {Number(entry) === 0 && Number(prizePool) > 0 && (
                           <p className="text-[10px] text-purple-400/70 px-1">
                              🎁 Sponsored prize pool — free entry tournament
                           </p>
                        )}
                        {Number(entry) > 0 && (
                           <p className="text-[10px] text-white/25 px-1">
                              Estimated pool from entries:{' '}
                              {(
                                 Number(entry) * Number(maxPlayers)
                              ).toLocaleString()}{' '}
                              USDC
                           </p>
                        )}
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
                  <div className="flex flex-col gap-4">
                     {/* Number of paid places */}
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
                           Number of Paid Places
                        </label>
                        <div className="flex gap-2 flex-wrap">
                           {[1, 2, 3, 4, 5, 8, 10].map((n) => (
                              <button
                                 key={n}
                                 type="button"
                                 onClick={() => handlePlacesChange(n)}
                                 className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                    payoutPlaces.length === n
                                       ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                                       : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20'
                                 }`}
                              >
                                 Top {n}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Payout rows */}
                     <div className="flex flex-col gap-2">
                        {payoutPlaces.map((pct, i) => (
                           <div key={i} className="flex items-center gap-3">
                              {/* Place label */}
                              <span
                                 className={`text-xs font-bold w-16 shrink-0 ${
                                    i === 0
                                       ? 'text-yellow-400'
                                       : i === 1
                                         ? 'text-slate-300'
                                         : i === 2
                                           ? 'text-orange-400'
                                           : 'text-white/40'
                                 }`}
                              >
                                 {i === 0
                                    ? '🥇 1st'
                                    : i === 1
                                      ? '🥈 2nd'
                                      : i === 2
                                        ? '🥉 3rd'
                                        : `${i + 1}th`}
                              </span>

                              {/* Percentage input */}
                              <div className="relative flex-1">
                                 <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={pct}
                                    onChange={(e) =>
                                       handlePayoutChange(i, e.target.value)
                                    }
                                    className="w-full bg-[#0d0d0f] border border-white/[0.08] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500/60 transition-all duration-200"
                                 />
                                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">
                                    %
                                 </span>
                              </div>

                              {/* Calculated amount */}
                              <span className="text-xs font-bold text-purple-400 w-28 text-right shrink-0">
                                 {Number(prizePool) > 0
                                    ? `${((Number(prizePool) * pct) / 100).toLocaleString()} USDC`
                                    : '—'}
                              </span>
                           </div>
                        ))}
                     </div>

                     {/* Total % indicator */}
                     <div
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold ${
                           totalPct === 100
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                              : totalPct > 100
                                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                        }`}
                     >
                        <span>Total Allocated</span>
                        <span>
                           {totalPct}%{' '}
                           {totalPct === 100
                              ? '✓'
                              : totalPct > 100
                                ? '— over 100%!'
                                : `— ${100 - totalPct}% remaining`}
                        </span>
                     </div>

                     <p className="text-[10px] text-white/20 px-1">
                        Payouts are automated via Rain Protocol escrow.
                     </p>
                  </div>
               </SectionCard>

               {/* Error message */}
               {error && (
                  <motion.p
                     initial={{ opacity: 0, y: -8 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-red-400 text-xs text-center bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3"
                  >
                     {error}
                  </motion.p>
               )}

               {/* Launch Button */}
               <motion.div
                  custom={5}
                  variants={{
                     hidden: { opacity: 0, y: 32 },
                     visible: (i: number) => ({
                        opacity: 1,
                        y: 0,
                        transition: {
                           duration: 0.5,
                           delay: i * 0.1,
                           ease: 'easeOut',
                        },
                     }),
                  }}
                  initial="hidden"
                  animate="visible"
               >
                  <motion.button
                     onClick={handleSubmit}
                     disabled={loading}
                     whileHover={{
                        scale: loading ? 1 : 1.02,
                        boxShadow: '0 0 40px rgba(139,92,246,0.65)',
                     }}
                     whileTap={{ scale: loading ? 1 : 0.98 }}
                     className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm tracking-wide shadow-[0_0_24px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                     {loading ? (
                        <>
                           <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                           Launching...
                        </>
                     ) : (
                        <>
                           <Rocket size={16} />
                           Launch Tournament
                        </>
                     )}
                  </motion.button>
               </motion.div>
            </div>
         </div>
      </div>
   );
}

// ── Sub-components ───────────────────────────────────────

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
