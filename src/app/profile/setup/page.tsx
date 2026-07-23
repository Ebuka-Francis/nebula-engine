// app/profile/setup/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProfileSetupPage() {
   const router = useRouter();
   const { user, loading } = useAuth();

   const [displayName, setDisplayName] = useState('');
   const [username, setUsername] = useState('');
   const [bio, setBio] = useState('');
   const [country, setCountry] = useState('');

   const [saving, setSaving] = useState(false);
   const [error, setError] = useState('');

   useEffect(() => {
      if (!loading && !user) {
         router.replace('/');
      }
   }, [user, loading, router]);

   if (loading || !user) {
      return (
         <main className="flex min-h-screen items-center justify-center bg-[#08080c]">
            <div className="text-sm text-white/40">
               Loading your profile...
            </div>
         </main>
      );
   }

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user) return;

      setSaving(true);
      setError('');

      try {
         await setDoc(
            doc(db, 'users', user.uid),
            {
               uid: user.uid,
               email: user.email,
               username,
               displayName,
               bio,
               country,
               createdAt: new Date(),
               updatedAt: new Date(),
            },
            { merge: true }
         );

         router.push('/profile');
      } catch (error) {
         console.error(error);
         setError('Something went wrong while saving your profile.');
      } finally {
         setSaving(false);
      }
   };

   return (
      <main className="relative min-h-screen overflow-hidden bg-[#08080d] px-4 py-12 text-white sm:px-6">

         {/* Background gradient atmosphere */}
         <div className="pointer-events-none absolute inset-0 overflow-hidden">

            {/* Top purple glow */}
            <div className="absolute left-1/2 top-[-180px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-purple-700/20 blur-[150px]" />

            {/* Bottom-right cyan glow */}
            <div className="absolute bottom-[-220px] right-[-180px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]" />

            {/* Bottom-left purple glow */}
            <div className="absolute bottom-[-250px] left-[-200px] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[150px]" />

            {/* Subtle grid */}
            <div
               className="absolute inset-0 opacity-[0.035]"
               style={{
                  backgroundImage: `
                     linear-gradient(rgba(168,85,247,0.8) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(168,85,247,0.8) 1px, transparent 1px)
                  `,
                  backgroundSize: '48px 48px',
               }}
            />

            {/* Soft vertical gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-[#08080d]" />
         </div>

         {/* Main Content */}
         <div className="relative z-10 mx-auto w-full max-w-xl">

            {/* Header */}
            <div className="mb-10 text-center">

               <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-[0_0_30px_rgba(168,85,247,0.35)]">
                  <Sparkles size={25} />
               </div>

               <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Complete your profile
               </h1>

               <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
                  Tell the Nebula who you are. You can always change these
                  details later.
               </p>
            </div>

            {/* Form Card */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#0d0d14]/80 p-6 shadow-[0_25px_100px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-8">

               <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Display Name */}
                  <div>
                     <label className="mb-2 block text-xs font-medium text-white/60">
                        Display name
                     </label>

                     <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Nebula Star"
                        className="h-12 w-full rounded-xl border border-white/[0.1] bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-500/60 focus:bg-purple-500/[0.05]"
                     />
                  </div>

                  {/* Username */}
                  <div>
                     <label className="mb-2 block text-xs font-medium text-white/60">
                        Username
                     </label>

                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30">
                           @
                        </span>

                        <input
                           type="text"
                           required
                           value={username}
                           onChange={(e) =>
                              setUsername(
                                 e.target.value
                                    .toLowerCase()
                                    .replace(/[^a-z0-9_]/g, '')
                              )
                           }
                           placeholder="nebula_star"
                           className="h-12 w-full rounded-xl border border-white/[0.1] bg-white/[0.035] pl-9 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-500/60 focus:bg-purple-500/[0.05]"
                        />
                     </div>
                  </div>

                  {/* Country */}
                  <div>
                     <label className="mb-2 block text-xs font-medium text-white/60">
                        Country
                     </label>

                     <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Nigeria"
                        className="h-12 w-full rounded-xl border border-white/[0.1] bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-500/60 focus:bg-purple-500/[0.05]"
                     />
                  </div>

                  {/* Bio */}
                  <div>
                     <div className="mb-2 flex items-center justify-between">
                        <label className="block text-xs font-medium text-white/60">
                           Bio
                        </label>

                        <span className="text-[11px] text-white/20">
                           {bio.length}/160
                        </span>
                     </div>

                     <textarea
                        value={bio}
                        maxLength={160}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell the Nebula something about you..."
                        rows={4}
                        className="w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-500/60 focus:bg-purple-500/[0.05]"
                     />
                  </div>

                  {/* Error */}
                  {error && (
                     <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                     </div>
                  )}

                  {/* Submit */}
                  <button
                     type="submit"
                     disabled={saving}
                     className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] transition hover:shadow-[0_0_35px_rgba(139,92,246,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                     {saving ? 'Saving profile...' : 'Complete profile'}

                     {!saving && (
                        <ArrowRight
                           size={17}
                           className="transition-transform group-hover:translate-x-1"
                        />
                     )}
                  </button>

               </form>
            </div>

            {/* Footer Text */}
            <p className="mt-6 text-center text-xs text-white/25">
               You can update your profile details anytime from your profile
               page.
            </p>

         </div>
      </main>
   );
}