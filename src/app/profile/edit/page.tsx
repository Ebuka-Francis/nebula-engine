'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
   ArrowLeft,
   Camera,
   Check,
   Loader2,
   Save,
   User,
} from 'lucide-react';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function EditProfilePage() {
   const router = useRouter();
   const { user, loading: authLoading } = useAuth();

   const fileInputRef = useRef<HTMLInputElement>(null);

   const [displayName, setDisplayName] = useState('');
   const [username, setUsername] = useState('');
   const [country, setCountry] = useState('');
   const [gender, setGender] = useState('');
   const [bio, setBio] = useState('');
   const [profileImage, setProfileImage] = useState('');

   const [selectedImage, setSelectedImage] = useState<File | null>(null);
   const [imagePreview, setImagePreview] = useState('');

   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [success, setSuccess] = useState('');
   const [error, setError] = useState('');

   /*
   |--------------------------------------------------------------------------
   | Load existing profile
   |--------------------------------------------------------------------------
   */

   useEffect(() => {
      const loadProfile = async () => {
         if (!user) return;

         try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
               const data = userSnap.data();

               setDisplayName(data.displayName || '');
               setUsername(data.username || '');
               setCountry(data.country || '');
               setGender(data.gender || '');
               setBio(data.bio || '');
               setProfileImage(data.profileImage || '');
            }
         } catch (error) {
            console.error(error);
            setError('Failed to load your profile.');
         } finally {
            setLoading(false);
         }
      };

      if (!authLoading) {
         if (!user) {
            router.replace('/');
            return;
         }

         loadProfile();
      }
   }, [user, authLoading, router]);

   /*
   |--------------------------------------------------------------------------
   | Select image
   |--------------------------------------------------------------------------
   */

   const handleImageChange = (
      e: React.ChangeEvent<HTMLInputElement>
   ) => {
      const file = e.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith('image/')) {
         setError('Please select a valid image.');
         return;
      }

      if (file.size > 5 * 1024 * 1024) {
         setError('Image must be less than 5MB.');
         return;
      }

      setError('');
      setSelectedImage(file);

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
   };





   /*
   |--------------------------------------------------------------------------
   | Save profile
   |--------------------------------------------------------------------------
   */

const handleSubmit = async (
   e: React.FormEvent<HTMLFormElement>
) => {
   e.preventDefault();

   if (!user) return;

   setSaving(true);
   setError('');
   setSuccess('');

   try {
      let finalProfileImage = profileImage;

      /*
       * Only upload a new image if the user selected one.
       */
      if (selectedImage) {
         finalProfileImage = await uploadToCloudinary(selectedImage);
      }

      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, {
         displayName: displayName.trim(),
         username: username.trim().toLowerCase(),
         country: country.trim(),
         gender,
         bio: bio.trim(),
         profileImage: finalProfileImage,
         updatedAt: new Date(),
      });

      setProfileImage(finalProfileImage);
      setSelectedImage(null);
      setSuccess('Profile updated successfully.');

      setTimeout(() => {
         router.push('/profile');
      }, 1200);
   } catch (error) {
      console.error(error);

      setError(
         'Something went wrong while updating your profile.'
      );
   } finally {
      setSaving(false);
   }
};

   /*
   |--------------------------------------------------------------------------
   | Loading state
   |--------------------------------------------------------------------------
   */

   if (authLoading || loading) {
      return (
         <main className="flex min-h-screen items-center justify-center bg-[#08080d] text-white">
            <div className="flex items-center gap-3 text-sm text-white/50">
               <Loader2
                  size={18}
                  className="animate-spin"
               />

               Loading your profile...
            </div>
         </main>
      );
   }

   /*
   |--------------------------------------------------------------------------
   | Page
   |--------------------------------------------------------------------------
   */

   return (
      <main className="relative min-h-screen overflow-hidden bg-[#08080d] px-4 py-8 text-white sm:px-6 lg:px-8">

         {/* Atmospheric background */}
         <div className="pointer-events-none absolute inset-0 overflow-hidden">

            {/* Purple glow */}
            <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[140px]" />

            {/* Cyan glow */}
            <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

            {/* Center glow */}
            <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-violet-600/[0.04] blur-[120px]" />

            {/* Grid */}
            <div
               className="absolute inset-0 opacity-[0.035]"
               style={{
                  backgroundImage: `
                     linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
                  `,
                  backgroundSize: '45px 45px',
               }}
            />
         </div>

         {/* Page content */}
         <div className="relative z-10 mx-auto w-full max-w-4xl">

            {/* Header */}
            <div className="mb-8 flex items-center gap-4">

               <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/60 transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"
               >
                  <ArrowLeft size={19} />
               </button>

               <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                     Edit Profile
                  </h1>

                  <p className="mt-1 text-sm text-white/40">
                     Customize your identity in the Nebula Engine.
                  </p>
               </div>

            </div>

            {/* Form Card */}
            <section className="rounded-3xl border border-white/[0.08] bg-[#101016]/80 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">

               <form
                  onSubmit={handleSubmit}
                  className="space-y-8"
               >

                  {/* Profile Image */}
                  <div className="flex flex-col items-center gap-4 border-b border-white/[0.06] pb-8 sm:flex-row">

                     <div className="relative">

                        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-purple-500/40 bg-white/[0.05] shadow-[0_0_35px_rgba(139,92,246,0.2)]">

                           {imagePreview || profileImage ? (
                              <img
                                 src={
                                    imagePreview ||
                                    profileImage
                                 }
                                 alt="Profile"
                                 className="h-full w-full object-cover"
                              />
                           ) : (
                              <User
                                 size={42}
                                 className="text-white/30"
                              />
                           )}

                        </div>

                        <button
                           type="button"
                           onClick={() =>
                              fileInputRef.current?.click()
                           }
                           className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#101016] bg-purple-600 text-white transition hover:bg-purple-500"
                        >
                           <Camera size={16} />
                        </button>

                    <input
   type="file"
   accept="image/*"
   onChange={(e) => {
      const file = e.target.files?.[0];

      if (file) {
         setSelectedImage(file);
      }
   }}
/>

                     </div>

                     <div className="text-center sm:text-left">
                        <h2 className="font-semibold text-white">
                           Profile photo
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-white/40">
                           Upload a square image for the best result.
                           Maximum size: 5MB.
                        </p>

                        <button
                           type="button"
                           onClick={() =>
                              fileInputRef.current?.click()
                           }
                           className="mt-3 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70 transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"
                        >
                           Change photo
                        </button>
                     </div>

                  </div>

                  {/* Form Fields */}
                  <div className="grid gap-5 sm:grid-cols-2">

                     {/* Display Name */}
                     <div>
                        <label className="mb-2 block text-xs font-medium text-white/60">
                           Display name
                        </label>

                        <input
                           type="text"
                           required
                           value={displayName}
                           onChange={(e) =>
                              setDisplayName(e.target.value)
                           }
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
                                       .replace(
                                          /[^a-z0-9_]/g,
                                          ''
                                       )
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
                           onChange={(e) =>
                              setCountry(e.target.value)
                           }
                           placeholder="Nigeria"
                           className="h-12 w-full rounded-xl border border-white/[0.1] bg-white/[0.035] px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-500/60 focus:bg-purple-500/[0.05]"
                        />
                     </div>

                     {/* Gender */}
                     <div>
                        <label className="mb-2 block text-xs font-medium text-white/60">
                           Gender
                        </label>

                        <select
                           value={gender}
                           onChange={(e) =>
                              setGender(e.target.value)
                           }
                           className="h-12 w-full rounded-xl border border-white/[0.1] bg-[#17171f] px-4 text-sm text-white outline-none transition focus:border-purple-500/60"
                        >
                           <option value="">
                              Select gender
                           </option>

                           <option value="male">
                              Male
                           </option>

                           <option value="female">
                              Female
                           </option>

                           <option value="other">
                              Other
                           </option>

                           <option value="prefer-not-to-say">
                              Prefer not to say
                           </option>
                        </select>
                     </div>

                  </div>

                  {/* Bio */}
                  <div>
                     <div className="mb-2 flex items-center justify-between">
                        <label className="text-xs font-medium text-white/60">
                           Bio
                        </label>

                        <span className="text-[11px] text-white/25">
                           {bio.length}/160
                        </span>
                     </div>

                     <textarea
                        value={bio}
                        maxLength={160}
                        rows={5}
                        onChange={(e) =>
                           setBio(e.target.value)
                        }
                        placeholder="Tell the Nebula something about you..."
                        className="w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-500/60 focus:bg-purple-500/[0.05]"
                     />
                  </div>

                  {/* Error */}
                  {error && (
                     <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                     </div>
                  )}

                  {/* Success */}
                  {success && (
                     <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                        <Check size={17} />

                        {success}
                     </div>
                  )}

                  {/* Buttons */}
                  <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-6 sm:flex-row sm:justify-end">

                     <button
                        type="button"
                        onClick={() =>
                           router.push('/profile')
                        }
                        className="h-12 rounded-xl border border-white/[0.1] bg-white/[0.03] px-6 text-sm font-semibold text-white/60 transition hover:bg-white/[0.07] hover:text-white"
                     >
                        Cancel
                     </button>

                     <button
                        type="submit"
                        disabled={saving}
                        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 px-7 text-sm font-bold text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] transition hover:shadow-[0_0_35px_rgba(139,92,246,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
                     >
                        {saving ? (
                           <>
                              <Loader2
                                 size={17}
                                 className="animate-spin"
                              />

                              Saving...
                           </>
                        ) : (
                           <>
                              <Save size={17} />

                              Save changes
                           </>
                        )}
                     </button>

                  </div>

               </form>

            </section>

         </div>

      </main>
   );
}