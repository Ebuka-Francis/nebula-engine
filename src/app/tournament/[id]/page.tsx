'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Tournament } from '../../../../types';
import { motion, Variants } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import {
   ArrowLeft,
   Zap,
   Users,
   Trophy,
   Clock,
   Plus,
   Crown,
   ScrollText,
   Coins,
   Brain,
   Club,
} from 'lucide-react';

// Services
import { joinTournament, startGame } from '@/lib/gameService';
import { getPlayerStats } from '@/lib/playerService';
import { useWalletSync } from '@/hooks/useWalletSync';
import { getAddress } from 'viem';

// Tab components
import LeaderboardTab from '@/components/tournaments/tabs/LeaderboardTab';
import RulesTab from '@/components/tournaments/tabs/RulesTab';
import PayoutsTab from '@/components/tournaments/tabs/PayoutsTab';
import PredictionsTab from '@/components/tournaments/tabs/PredictionsTab';
import PlayTab from '@/components/tournaments/tabs/PlayTab';
import { useEscrow } from '@/hooks/useEscrow';
import UsernameModal from '@/components/modals/UsernameModal';

interface Tab {
   id: string;
   label: string;
   icon: LucideIcon;
}

const tabs: Tab[] = [
   { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
   { id: 'rules', label: 'Rules', icon: ScrollText },
   { id: 'payouts', label: 'Payouts', icon: Coins },
   { id: 'predictions', label: 'Predictions', icon: Brain },
   { id: 'play', label: 'Play', icon: Club },
];

const contentVariants: Variants = {
   hidden: { opacity: 0, y: 16 },
   visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
   },
};

function Skeleton() {
   return (
      <div className="min-h-screen bg-[#0d0d0f] px-4 md:px-8 py-10">
         <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-4 w-32 rounded-full bg-white/[0.05] animate-pulse" />
            <div className="h-40 rounded-2xl bg-white/[0.03] animate-pulse" />
            <div className="h-10 rounded-xl bg-white/[0.03] animate-pulse" />
            <div className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />
         </div>
      </div>
   );
}

function StatusBadge({ status }: { status: string }) {
   if (status === 'live')
      return (
         <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
         </span>
      );
   if (status === 'ended')
      return (
         <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/30 text-[10px] font-semibold">
            Ended
         </span>
      );
   return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-semibold">
         <Clock size={10} />
         Upcoming
      </span>
   );
}

export default function TournamentDetailPage() {
   const { id } = useParams();
   const { address, isConnected } = useAccount();
   const { needsUsername, setNeedsUsername } = useWalletSync();
   const { joinTournamentOnChain } = useEscrow();

   const [showUsernameModal, setShowUsernameModal] = useState(false);
   const [tournament, setTournament] = useState<Tournament | null>(null);
   const [loading, setLoading] = useState(true);
   const [notFound, setNotFound] = useState(false);
   const [activeTab, setActiveTab] = useState('leaderboard');
   const [joining, setJoining] = useState(false);
   const [joined, setJoined] = useState(false);
   const [starting, setStarting] = useState(false);
   const [joinError, setJoinError] = useState('');

   const isCreator = tournament?.creatorAddress === address?.toLowerCase();

   // Real-time tournament listener
   useEffect(() => {
      if (!id) return;
      const ref = doc(db, 'tournaments', id as string);
      const unsubscribe = onSnapshot(ref, (snap) => {
         if (!snap.exists()) {
            setNotFound(true);
         } else {
            setTournament({ id: snap.id, ...snap.data() } as Tournament);
         }
         setLoading(false);
      });
      return () => unsubscribe();
   }, [id]);

   // Check if already joined
   useEffect(() => {
      if (!address || !tournament) return;
      const checkJoined = async () => {
         const ref = doc(
            db,
            'tournaments',
            tournament.id,
            'registrations',
            address.toLowerCase(),
         );
         const snap = await getDoc(ref);
         setJoined(snap.exists());
      };
      checkJoined();
   }, [address, tournament]);

   const handleJoin = async () => {
      if (!isConnected || !address) {
         setJoinError('Please connect your wallet first.');
         return;
      }

      setJoining(true);
      setJoinError('');

      try {
         const player = await getPlayerStats(address.toLowerCase());
         if (!player?.username) {
            setJoinError('Please set a username first.');
            return;
         }

         // ✅ Only call on-chain if contract is deployed
         //  if (tournament!.entryFee > 0 && ESCROW_CONTRACT_ADDRESS !== '0x...') {
         //    await joinTournamentOnChain(tournament!.id, tournament!.entryFee);
         //  }

         // Save to Firestore regardless
         await joinTournament(
            tournament!.id,
            address.toLowerCase(),
            player.username,
         );
         setJoined(true);
      } catch (err: any) {
         console.error('Full join error:', err);
         setJoinError(err.message ?? 'Failed to join tournament.');
      } finally {
         setJoining(false);
      }
   };

   const handleStartGame = async () => {
      setStarting(true);
      try {
         await startGame(tournament!.id);
      } catch (err: any) {
         console.error('Start game error:', err.message);
      } finally {
         setStarting(false);
      }
   };

   if (loading) return <Skeleton />;
   if (notFound)
      return (
         <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center gap-4">
            <Trophy size={40} className="text-white/10" />
            <p className="text-white/30 text-sm">Tournament not found.</p>
            <Link
               href="/tournament"
               className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
            >
               ← Back to Tournaments
            </Link>
         </div>
      );
   if (!tournament) return null;

   return (
      <div className="min-h-screen bg-[#0d0d0f] px-4 md:px-8 py-10 font-sans">
         {/* {showUsernameModal && (
            <UsernameModal
               address={address!}
               onComplete={async () => {
                  setNeedsUsername(false);
                  setShowUsernameModal(false);
                  await handleJoin(); // ✅ auto-continues after username is set
               }}
               onClose={() => setShowUsernameModal(false)}
            />
         )} */}
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-700/8 blur-[120px] rounded-full pointer-events-none z-0" />

         <div className="relative z-10 max-w-3xl mx-auto">
            {/* Back */}
            <motion.div
               initial={{ opacity: 0, x: -16 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.4 }}
            >
               <Link
                  href="/tournament"
                  className="inline-flex items-center gap-1.5 text-white/30 text-xs font-medium hover:text-purple-400 transition-colors duration-200 mb-5"
               >
                  <ArrowLeft size={13} />
                  Back to Tournaments
               </Link>
            </motion.div>

            {/* Hero Card */}
            <motion.div
               initial={{ opacity: 0, y: 24 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, ease: 'easeOut' }}
               className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 md:p-6 mb-4"
            >
               <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                  <div>
                     <div className="flex items-center gap-2.5 flex-wrap mb-1">
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                           {tournament.name}
                        </h1>
                        <StatusBadge status={tournament.status} />
                     </div>
                     <p className="text-white/30 text-xs">
                        {tournament.type} &nbsp;•&nbsp; Created by{' '}
                        <span className="text-purple-400/70 font-mono">
                           {tournament.creatorAddress.slice(0, 6)}...
                           {tournament.creatorAddress.slice(-4)}
                        </span>
                        {isCreator && (
                           <span className="ml-2 text-purple-400/50 text-[10px] font-semibold uppercase tracking-wider">
                              (You)
                           </span>
                        )}
                     </p>
                  </div>

                  {tournament.status !== 'ended' && (
                     <div className="flex flex-col items-end gap-2 shrink-0">
                        {/* Creator sees Start Game button */}
                        {isCreator && (
                           <motion.button
                              onClick={handleStartGame}
                              disabled={
                                 starting || tournament.currentPlayers < 2
                              }
                              whileHover={{
                                 scale: 1.04,
                                 boxShadow: '0 0 30px rgba(139,92,246,0.6)',
                              }}
                              whileTap={{ scale: 0.97 }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              {starting ? (
                                 <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Starting...
                                 </>
                              ) : (
                                 <>
                                    <Crown size={15} />
                                    {tournament.currentPlayers < 2
                                       ? 'Need 2+ players'
                                       : 'Start Game'}
                                 </>
                              )}
                           </motion.button>
                        )}

                        {/* ✅ Everyone including creator can join */}
                        {joined ? (
                           <div className="flex flex-col items-end gap-1">
                              <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold">
                                 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                 Joined
                              </span>
                              {!isCreator && (
                                 <span className="text-white/25 text-[10px]">
                                    Waiting for host to start...
                                 </span>
                              )}
                           </div>
                        ) : (
                           <motion.button
                              onClick={handleJoin}
                              disabled={joining}
                              whileHover={{
                                 scale: 1.04,
                                 boxShadow: '0 0 30px rgba(139,92,246,0.6)',
                              }}
                              whileTap={{ scale: 0.97 }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-[0_0_20px_rgba(139,92,246,0.35)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              {joining ? (
                                 <>
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                    Joining...
                                 </>
                              ) : (
                                 <>
                                    <Plus size={15} />
                                    Join Tournament
                                 </>
                              )}
                           </motion.button>
                        )}

                        {joinError && (
                           <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-400 text-[11px] max-w-[200px] text-right"
                           >
                              {joinError}
                           </motion.p>
                        )}
                     </div>
                  )}
               </div>

               {/* Stats */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                     {
                        icon: Zap,
                        label: 'Entry Fee',
                        value:
                           tournament.entryFee === 0
                              ? 'Free'
                              : `${tournament.entryFee} USDC`,
                     },
                     {
                        icon: Trophy,
                        label: 'Prize Pool',
                        value: `${tournament.prizePool.toLocaleString()} USDC`,
                     },
                     {
                        icon: Users,
                        label: 'Players',
                        value: `${tournament.currentPlayers} / ${tournament.maxPlayers}`,
                     },
                     {
                        icon: Clock,
                        label: 'Status',
                        value:
                           tournament.status === 'live'
                              ? 'Live Now'
                              : tournament.status === 'ended'
                                ? 'Ended'
                                : 'Upcoming',
                     },
                  ].map((stat) => (
                     <div
                        key={stat.label}
                        className="flex flex-col gap-1 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                     >
                        <div className="flex items-center gap-1.5">
                           <stat.icon size={11} className="text-purple-400" />
                           <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
                              {stat.label}
                           </span>
                        </div>
                        <span className="text-white font-bold text-sm">
                           {stat.value}
                        </span>
                     </div>
                  ))}
               </div>

               {tournament.sideBetting && (
                  <div className="mt-3 flex items-center gap-1.5 w-fit px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-semibold">
                     <Zap size={10} />
                     Side Betting Enabled
                  </div>
               )}
            </motion.div>

            {/* Tabs */}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.25, duration: 0.4 }}
               className="flex gap-1 mb-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-1"
            >
               {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                           isActive
                              ? 'text-white'
                              : 'text-white/30 hover:text-white/60'
                        }`}
                     >
                        {isActive && (
                           <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 rounded-lg bg-purple-600/30 border border-purple-500/30"
                              transition={{
                                 type: 'spring',
                                 stiffness: 400,
                                 damping: 30,
                              }}
                           />
                        )}
                        <IconComponent size={12} className="relative z-10" />
                        <span className="relative z-10 hidden sm:inline">
                           {tab.label}
                        </span>
                     </button>
                  );
               })}
            </motion.div>

            {/* Tab Content */}
            <motion.div
               key={activeTab}
               variants={contentVariants}
               initial="hidden"
               animate="visible"
               className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden"
            >
               {activeTab === 'leaderboard' && (
                  <LeaderboardTab tournament={tournament} />
               )}
               {activeTab === 'rules' && <RulesTab tournament={tournament} />}
               {activeTab === 'payouts' && (
                  <PayoutsTab tournament={tournament} />
               )}
               {activeTab === 'predictions' && (
                  <PredictionsTab tournament={tournament} />
               )}
               {activeTab === 'play' && <PlayTab tournament={tournament} />}
            </motion.div>
         </div>
      </div>
   );
}
