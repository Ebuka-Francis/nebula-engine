'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
   ArrowLeft,
   Copy,
   Edit3,
   ExternalLink,
   LogOut,
   Trophy,
   Wallet,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';

import {
   doc,
   getDoc,
} from 'firebase/firestore';

interface UserProfile {
   username?: string;
   displayName?: string;
   bio?: string;
   avatarUrl?: string;
   walletAddress?: string;
   country?: string;
   createdAt?: unknown;
}

export default function ProfilePage() {
   const router = useRouter();

   const { user, loading: authLoading, logout } = useAuth();

   const [profile, setProfile] = useState<UserProfile | null>(null);
   const [loading, setLoading] = useState(true);
   const [copied, setCopied] = useState(false);

   useEffect(() => {
      if (authLoading) return;

      if (!user) {
         router.push('/');
         return;
      }

      const fetchProfile = async () => {
         try {
            const userRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
               setProfile(userSnapshot.data() as UserProfile);
            }
         } catch (error) {
            console.error('Failed to load profile:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchProfile();
   }, [user, authLoading, router]);

   const handleCopyWallet = async () => {
      if (!profile?.walletAddress) return;

      await navigator.clipboard.writeText(profile.walletAddress);

      setCopied(true);

      setTimeout(() => {
         setCopied(false);
      }, 1500);
   };

   const handleLogout = async () => {
      await logout();
      router.push('/');
   };

   if (authLoading || loading) {
      return (
         <main className="min-h-screen bg-[#09090b] flex items-center justify-center">
            <div className="text-sm text-white/40">
               Loading profile...
            </div>
         </main>
      );
   }

   return (
      <main className="min-h-screen bg-[#09090b] text-white">

         {/* Header */}
         <div className="border-b border-white/[0.06]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

               <button
                  onClick={() => router.push('/')}
                  className="flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
               >
                  <ArrowLeft size={16} />
                  Back
               </button>

               <button
                  onClick={() => router.push('/profile/edit')}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-sm text-white/70 transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"
               >
                  <Edit3 size={15} />
                  Edit profile
               </button>

            </div>
         </div>

         {/* Profile Content */}
         <div className="mx-auto max-w-7xl px-6 py-10">

            {/* Profile Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111114]">

               {/* Background Glow */}
               <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-purple-600/10 blur-[120px]" />

               <div className="relative flex flex-col gap-8 p-8 md:flex-row md:items-center md:p-10">

                  {/* Avatar */}
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-600 to-fuchsia-600 text-4xl font-bold shadow-[0_0_40px_rgba(168,85,247,0.25)]">
                     {profile?.avatarUrl ? (
                        <img
                           src={profile.avatarUrl}
                           alt="Profile avatar"
                           className="h-full w-full object-cover"
                        />
                     ) : (
                        profile?.username?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase()
                     )}
                  </div>

                  {/* User Information */}
                  <div className="flex-1">

                     <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">
                           {profile?.displayName ||
                              profile?.username ||
                              'Anonymous Player'}
                        </h1>

                        <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                           Player
                        </span>
                     </div>

                     {profile?.username && (
                        <p className="mt-2 text-sm text-purple-400">
                           @{profile.username}
                        </p>
                     )}

                     {profile?.bio && (
                        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45">
                           {profile.bio}
                        </p>
                     )}

                     {/* Wallet */}
                     {profile?.walletAddress && (
                        <button
                           onClick={handleCopyWallet}
                           className="mt-5 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/40 transition hover:border-purple-500/30 hover:text-white/70"
                        >
                           <Wallet size={14} />

                           <span>
                              {profile.walletAddress.slice(0, 6)}...
                              {profile.walletAddress.slice(-4)}
                           </span>

                           <Copy size={13} />

                           {copied && (
                              <span className="text-cyan-400">
                                 Copied
                              </span>
                           )}
                        </button>
                     )}

                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 md:w-[400px]">

                     <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
                        <p className="text-2xl font-bold">0</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wider text-white/30">
                           Tournaments
                        </p>
                     </div>

                     <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
                        <p className="text-2xl font-bold">0</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wider text-white/30">
                           Wins
                        </p>
                     </div>

                     <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
                        <p className="text-2xl font-bold">0</p>
                        <p className="mt-1 text-[11px] uppercase tracking-wider text-white/30">
                           Rank
                        </p>
                     </div>

                  </div>

               </div>
            </section>

            {/* Main Grid */}
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">

               {/* Activity */}
               <section className="rounded-3xl border border-white/[0.08] bg-[#111114] p-6">

                  <div className="mb-6 flex items-center justify-between">
                     <div>
                        <h2 className="text-lg font-semibold">
                           Recent activity
                        </h2>

                        <p className="mt-1 text-sm text-white/35">
                           Your latest activity across Nebula Engine.
                        </p>
                     </div>

                     <Trophy
                        size={20}
                        className="text-purple-400"
                     />
                  </div>

                  <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015]">

                     <div className="text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10">
                           <Trophy
                              size={20}
                              className="text-purple-400"
                           />
                        </div>

                        <p className="text-sm text-white/50">
                           No activity yet
                        </p>

                        <p className="mt-1 text-xs text-white/25">
                           Join your first tournament to get started.
                        </p>
                     </div>

                  </div>

               </section>

               {/* Side Panel */}
               <aside className="space-y-6">

                  {/* Account */}
                  <section className="rounded-3xl border border-white/[0.08] bg-[#111114] p-6">

                     <h2 className="text-sm font-semibold">
                        Account
                     </h2>

                     <div className="mt-5 space-y-4">

                        <div>
                           <p className="text-[11px] uppercase tracking-wider text-white/25">
                              Email
                           </p>

                           <p className="mt-1 truncate text-sm text-white/60">
                              {user?.email}
                           </p>
                        </div>

                        <div>
                           <p className="text-[11px] uppercase tracking-wider text-white/25">
                              Member since
                           </p>

                           <p className="mt-1 text-sm text-white/60">
                              {user?.metadata.creationTime
                                 ? new Date(
                                      user.metadata.creationTime
                                   ).toLocaleDateString()
                                 : 'Recently'}
                           </p>
                        </div>

                     </div>

                  </section>

                  {/* Logout */}
                  <button
                     onClick={handleLogout}
                     className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-5 py-3 text-sm font-semibold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                  >
                     <LogOut size={16} />
                     Log out
                  </button>

               </aside>

            </div>

         </div>

      </main>
   );
}