'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import {
   Search,
   SlidersHorizontal,
   Plus,
   Users,
   Trophy,
   Clock,
   Zap,
} from 'lucide-react';

import { subscribeToTournaments } from '@/lib/tournamentService';
import { Tournament } from '../../../types';

const containerVariants: Variants = {
   hidden: {},
   visible: {
      transition: { staggerChildren: 0.1 },
   },
};

const cardVariants = (index: number): Variants => ({
   hidden: {
      opacity: 0,
      x: index % 2 === 0 ? -80 : 80,
      y: 30,
   },
   visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.55, ease: 'easeOut' },
   },
});

const headerVariants: Variants = {
   hidden: { opacity: 0, y: -24 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
   },
};

const searchVariants: Variants = {
   hidden: { opacity: 0, y: 16 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.2, ease: 'easeOut' },
   },
};

function StatusBadge({ status, label }: { status: string; label?: string }) {
   if (status === 'live') {
      return (
         <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Now
         </span>
      );
   }
   if (status === 'ended') {
      return (
         <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/30 text-[11px] font-semibold">
            Ended
         </span>
      );
   }
   return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-semibold">
         <Clock size={10} />
         {label}
      </span>
   );
}

function StatItem({
   icon: Icon,
   label,
   value,
}: {
   icon: any;
   label: string;
   value: string | number;
}) {
   return (
      <div className="flex flex-col gap-0.5">
         <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
            {label}
         </span>
         <div className="flex items-center gap-1.5">
            <Icon size={12} className="text-purple-400 shrink-0" />
            <span className="text-white text-sm font-bold">{value}</span>
         </div>
      </div>
   );
}

export default function TournamentsPage() {
   const [tournaments, setTournaments] = useState<Tournament[]>([]);
   const [search, setSearch] = useState('');
   const [filter, setFilter] = useState('all');
   const [loading, setLoading] = useState(true);

   function formatTimestamp(timestamp: any): string {
      if (!timestamp) return 'TBA';
      const date = timestamp.toDate?.() ?? new Date(timestamp);
      const diff = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diff < 0) {
         // future date — show actual date
         return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
         });
      }
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
   }

   useEffect(() => {
      const unsubscribe = subscribeToTournaments((data) => {
         setTournaments(data);
         setLoading(false);
      });
      return () => unsubscribe(); // cleanup on unmount
   }, []);

   const filtered = tournaments.filter((t) => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || t.status === filter;
      return matchSearch && matchFilter;
   });

   if (loading) {
      return (
         <div className="min-h-screen bg-[#0d0d0f] px-4 md:px-8 py-10">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-24">
               {[...Array(6)].map((_, i) => (
                  <div
                     key={i}
                     className="h-48 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse"
                  />
               ))}
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#0d0d0f] px-4 md:px-8 py-10 font-sans">
         {/* Bg glow */}
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-700/8 blur-[120px] rounded-full pointer-events-none z-0" />

         <div className="relative z-10 max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
               className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8"
               initial="hidden"
               animate="visible"
               variants={headerVariants}
            >
               <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
                     Tournaments
                  </h1>
                  <p className="text-[#6b6b80] text-sm">
                     Browse and join tokenized poker tournaments
                  </p>
               </div>

               <Link href={'tournament/create'}>
                  <motion.button
                     whileHover={{
                        scale: 1.04,
                        boxShadow: '0 0 30px rgba(139,92,246,0.6)',
                     }}
                     whileTap={{ scale: 0.97 }}
                     className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] shrink-0 self-start cursor-pointer"
                  >
                     <Plus size={16} />
                     Create Tournament
                  </motion.button>
               </Link>
            </motion.div>

            {/* Search + Filter */}
            <motion.div
               className="flex flex-col sm:flex-row gap-3 mb-6"
               initial="hidden"
               animate="visible"
               variants={searchVariants}
            >
               <div className="relative flex-1">
                  <Search
                     size={15}
                     className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                     type="text"
                     placeholder="Search tournaments..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] transition-all duration-200"
                  />
               </div>
               <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm hover:border-purple-500/40 hover:text-white transition-all duration-200">
                  <SlidersHorizontal size={15} />
                  <span className="hidden sm:inline">Filter</span>
               </button>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
               className="flex gap-2 mb-8"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3, duration: 0.4 }}
            >
               {['all', 'live', 'upcoming', 'ended'].map((tab) => (
                  <button
                     key={tab}
                     onClick={() => setFilter(tab)}
                     className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200 ${
                        filter === tab
                           ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                           : 'bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20'
                     }`}
                  >
                     {tab}
                  </button>
               ))}
            </motion.div>

            {/* Tournament Cards Grid */}
            <motion.div
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
               initial="hidden"
               animate="visible"
               variants={containerVariants}
            >
               {filtered.map((t, i) => (
                  <Link href={`/tournament/${t.id}`} key={t.id}>
                     <motion.div
                        key={t.id}
                        variants={cardVariants(i)}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`group relative flex flex-col gap-4 p-5 rounded-2xl border cursor-pointer transition-colors duration-300 ${
                           t.status === 'ended'
                              ? 'border-white/[0.05] bg-white/[0.02] opacity-60'
                              : 'border-white/[0.07] bg-white/[0.03] hover:border-purple-500/40 hover:bg-purple-500/[0.04]'
                        }`}
                     >
                        {/* Hover glow */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.07),transparent_60%)] pointer-events-none" />

                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2">
                           <div>
                              <h3 className="text-white font-bold text-base leading-tight mb-0.5">
                                 {t.name}
                              </h3>
                              <span className="text-white/30 text-xs">
                                 {t.type}
                              </span>
                           </div>
                           <StatusBadge status={t.status} label={t.status} />
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                           <StatItem
                              icon={Zap}
                              label="Entry"
                              value={t.entryFee}
                           />
                           <StatItem
                              icon={Trophy}
                              label="Prize Pool"
                              value={t.prizePool}
                           />
                           <StatItem
                              icon={Users}
                              label="Players"
                              value={t.maxPlayers}
                           />
                           <StatItem
                              icon={Clock}
                              label="Starts"
                              value={formatTimestamp(t.startTime)}
                           />
                        </div>

                        {/* Side betting tag */}
                        {t.sideBetting && (
                           <div className="flex items-center gap-1.5 w-fit px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-semibold">
                              <Zap size={10} />
                              Side Betting Enabled
                           </div>
                        )}

                        {/* Bottom shimmer on hover */}
                        <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                     </motion.div>
                  </Link>
               ))}
            </motion.div>

            {filtered.length === 0 && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 text-white/20 text-sm"
               >
                  No tournaments found.
               </motion.div>
            )}
         </div>
      </div>
   );
}
