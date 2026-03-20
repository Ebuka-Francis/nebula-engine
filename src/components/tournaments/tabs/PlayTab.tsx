'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAccount } from 'wagmi';
import { Tournament } from '../../../../types';
import { Clock, CheckCircle, XCircle, Gamepad2 } from 'lucide-react';
import PokerTable from '@/components/game/PokerTable';

interface Props {
   tournament: Tournament;
}

export default function PlayTab({ tournament }: Props) {
   const { address, isConnected } = useAccount();
   const [confirmed, setConfirmed] = useState(false);
   const [confirming, setConfirming] = useState(false);
   const [isRegistered, setIsRegistered] = useState(false);
   const [timeLeft, setTimeLeft] = useState<number | null>(null);
   const [expired, setExpired] = useState(false);
   const [loading, setLoading] = useState(true);

   const CONFIRM_WINDOW_MINS = 20; // minutes to confirm after start time

   // Check if player is registered and already confirmed
   useEffect(() => {
      if (!address || !tournament) return;

      const check = async () => {
         const regRef = doc(
            db,
            'tournaments',
            tournament.id,
            'registrations',
            address.toLowerCase(),
         );
         const regSnap = await getDoc(regRef);

         if (!regSnap.exists()) {
            setIsRegistered(false);
            setLoading(false);
            return;
         }

         setIsRegistered(true);
         setConfirmed(regSnap.data()?.confirmed === true);
         setLoading(false);
      };

      check();
   }, [address, tournament]);

   // Countdown timer — 20 mins from start time
   useEffect(() => {
      if (!tournament.startTime) return;

      const startTime = tournament.startTime.toDate?.() ?? new Date(0);
      const deadline = new Date(
         startTime.getTime() + CONFIRM_WINDOW_MINS * 60 * 1000,
      );

      const interval = setInterval(() => {
         const remaining = Math.max(0, deadline.getTime() - Date.now());
         setTimeLeft(Math.floor(remaining / 1000));
         if (remaining === 0) {
            setExpired(true);
            clearInterval(interval);
         }
      }, 1000);

      return () => clearInterval(interval);
   }, [tournament.startTime]);

   const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
   };

   const handleConfirm = async () => {
      if (!address || !isConnected) return;
      setConfirming(true);
      try {
         const regRef = doc(
            db,
            'tournaments',
            tournament.id,
            'registrations',
            address.toLowerCase(),
         );
         await setDoc(
            regRef,
            { confirmed: true, confirmedAt: serverTimestamp() },
            { merge: true },
         );
         setConfirmed(true);
      } catch (err) {
         console.error('Confirm error:', err);
      } finally {
         setConfirming(false);
      }
   };

   if (loading) {
      return (
         <div className="py-12 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
         </div>
      );
   }

   // Not registered
   if (!isRegistered) {
      return (
         <div className="p-8 flex flex-col items-center gap-3 text-center">
            <XCircle size={36} className="text-red-400/50" />
            <p className="text-white/50 text-sm font-semibold">
               You haven't joined this tournament.
            </p>
            <p className="text-white/25 text-xs">
               Only registered players can access the game table.
            </p>
         </div>
      );
   }

   // Window expired and not confirmed
   if (expired && !confirmed) {
      return (
         <div className="p-8 flex flex-col items-center gap-3 text-center">
            <XCircle size={36} className="text-red-400/60" />
            <p className="text-red-400 text-sm font-bold">
               Confirmation window expired
            </p>
            <p className="text-white/30 text-xs max-w-xs">
               You didn't confirm your seat within {CONFIRM_WINDOW_MINS} minutes
               of the start time and have been removed from this tournament.
            </p>
         </div>
      );
   }

   // Confirmed — show poker table
   if (confirmed) {
      return (
         <div className="h-screen -mx-4 -mb-4">
            <PokerTable tournamentId={tournament.id} />
         </div>
      );
   }

   // Needs to confirm
   return (
      <div className="p-8 flex flex-col items-center gap-6 text-center">
         {/* Timer */}
         {timeLeft !== null && (
            <div className="flex flex-col items-center gap-1">
               <div
                  className={`text-4xl font-black tabular-nums ${
                     timeLeft <= 60
                        ? 'text-red-400'
                        : timeLeft <= 300
                          ? 'text-yellow-400'
                          : 'text-white'
                  }`}
               >
                  {formatTime(timeLeft)}
               </div>
               <p className="text-white/30 text-xs uppercase tracking-widest">
                  Time remaining to confirm
               </p>
            </div>
         )}

         {/* Warning */}
         <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400/10 border border-yellow-400/20 max-w-sm">
            <Clock size={14} className="text-yellow-400 shrink-0" />
            <p className="text-yellow-300 text-xs leading-relaxed text-left">
               You must confirm your seat within{' '}
               <span className="font-bold">{CONFIRM_WINDOW_MINS} minutes</span>{' '}
               of the start time or you'll be automatically removed.
            </p>
         </div>

         {/* Confirm button */}
         <motion.button
            onClick={handleConfirm}
            disabled={confirming}
            whileHover={{
               scale: 1.04,
               boxShadow: '0 0 40px rgba(139,92,246,0.65)',
            }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-black text-base shadow-[0_0_24px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
         >
            {confirming ? (
               <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Confirming...
               </>
            ) : (
               <>
                  <Gamepad2 size={20} />
                  Confirm Seat & Enter Table
               </>
            )}
         </motion.button>

         <p className="text-white/20 text-[10px]">
            Clicking confirm locks you into this tournament. Good luck! 🃏
         </p>
      </div>
   );
}
