'use client';

import { useEffect, useState } from 'react';
import {
   ArrowRight,
   Eye,
   EyeOff,
   LockKeyhole,
   Mail,
   Sparkles,
   X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
   GoogleAuthProvider,
   TwitterAuthProvider,
   signInWithPopup,
   signInWithEmailAndPassword,
   createUserWithEmailAndPassword,
   getAdditionalUserInfo,
} from 'firebase/auth';

import { auth } from '@/lib/firebase';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
   mode: AuthMode;
   onClose: () => void;
   onModeChange: (mode: AuthMode) => void;
}

export default function AuthModal({
   mode,
   onClose,
   onModeChange,
}: AuthModalProps) {
const router = useRouter();

   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   const isSignup = mode === 'signup';

   useEffect(() => {
   const originalOverflow = document.body.style.overflow;

   document.body.style.overflow = 'hidden';

   return () => {
      document.body.style.overflow = originalOverflow;
   };
}, []);



const handleEmailAuth = async (e: React.FormEvent) => {
   e.preventDefault();

   setError('');
   setLoading(true);

   try {
      if (isSignup) {
         await createUserWithEmailAndPassword(auth, email, password);

         onClose();
         router.push('/profile/setup');
      } else {
         await signInWithEmailAndPassword(auth, email, password);

         onClose();
      }
   } catch (error) {
      const firebaseError = error as { code: string };

      setError(getFirebaseErrorMessage(firebaseError.code));
   } finally {
      setLoading(false);
   }
};

const handleGoogleAuth = async () => {
   setError('');
   setLoading(true);

   try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const additionalUserInfo = getAdditionalUserInfo(result);

      onClose();

      if (additionalUserInfo?.isNewUser) {
         router.push('/profile/setup');
      }
   } catch (error) {
      const firebaseError = error as { code: string };
      setError(getFirebaseErrorMessage(firebaseError.code));
   } finally {
      setLoading(false);
   }
};
const handleTwitterAuth = async () => {
   setError('');
   setLoading(true);

   try {
      const provider = new TwitterAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const additionalUserInfo = getAdditionalUserInfo(result);

      onClose();

      if (additionalUserInfo?.isNewUser) {
         router.push('/profile/setup');
      }
   } catch (error) {
      const firebaseError = error as { code: string };
      setError(getFirebaseErrorMessage(firebaseError.code));
   } finally {
      setLoading(false);
   }
};

   return (
   <div
   onClick={onClose}
   className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
>
   {/* Nebula ambient glow */}
   <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/20 blur-[140px]" />

<div
   onClick={(e) => e.stopPropagation()}
   style={{ backgroundColor: 'black' }}
   className="relative max-h-[calc(100vh-2rem)] w-full max-w-[460px] overflow-y-auto overflow-x-hidden rounded-[28px] border border-white/[0.1] shadow-[0_25px_100px_rgba(0,0,0,0.8)]"
>
            {/* Decorative top glow */}
            <div className="absolute left-1/2 top-0 h-[2px] w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

            {/* Background decorations */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-purple-600/10 blur-3xl" />

            <div className="relative p-7 sm:p-9">
               {/* Header */}
               <div className="mb-8 flex items-start justify-between">
                  <div>
                     <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-[0_0_25px_rgba(168,85,247,0.35)]">
                        <Sparkles size={21} className="text-white" />
                     </div>

                     <h2 className="text-2xl font-bold tracking-tight text-white">
                        {isSignup ? 'Enter the Nebula' : 'Welcome back'}
                     </h2>

                     <p className="mt-2 text-sm leading-6 text-white/45">
                        {isSignup
                           ? 'Create your account and enter a new dimension.'
                           : 'Continue your journey through the Nebula Engine.'}
                     </p>
                  </div>

                  <button
                     type="button"
                     onClick={onClose}
                     className="rounded-xl p-2 text-white/40 transition hover:bg-white/[0.06] hover:text-white"
                  >
                     <X size={20} />
                  </button>
               </div>

               {/* Social authentication */}
               <div className="space-y-3">
                  <button
                     type="button"
                     onClick={handleGoogleAuth}
                     disabled={loading}
                     className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.1] bg-white/[0.04] text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                     <GoogleIcon />
                     Continue with Google
                  </button>

                  <button
                     type="button"
                     onClick={handleTwitterAuth}
                     disabled={loading}
                     className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.1] bg-white/[0.04] text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                     <span className="text-lg font-bold">𝕏</span>
                     Continue with X
                  </button>
               </div>

               {/* Divider */}
               <div className="my-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/[0.08]" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                     Or continue with email
                  </span>

                  <div className="h-px flex-1 bg-white/[0.08]" />
               </div>

               {/* Email form */}
               <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div>
                     <label className="mb-2 block text-xs font-medium text-white/55">
                        Email address
                     </label>

                     <div className="relative">
                        <Mail
                           size={17}
                           className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                        />

                        <input
                           type="email"
                           required
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           placeholder="you@example.com"
                           className="h-12 w-full rounded-xl border border-white/[0.1] bg-white/[0.035] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-500/60 focus:bg-purple-500/[0.04]"
                        />
                     </div>
                  </div>

                  <div>
                     <label className="mb-2 block text-xs font-medium text-white/55">
                        Password
                     </label>

                     <div className="relative">
                        <LockKeyhole
                           size={17}
                           className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                        />

                        <input
                           type={showPassword ? 'text' : 'password'}
                           required
                           minLength={6}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="Enter your password"
                           className="h-12 w-full rounded-xl border border-white/[0.1] bg-white/[0.035] pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-500/60 focus:bg-purple-500/[0.04]"
                        />

                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white"
                        >
                           {showPassword ? (
                              <EyeOff size={17} />
                           ) : (
                              <Eye size={17} />
                           )}
                        </button>
                     </div>
                  </div>

                  {error && (
                     <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-300">
                        {error}
                     </div>
                  )}

                  <button
                     type="submit"
                     disabled={loading}
                     className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] transition hover:shadow-[0_0_35px_rgba(139,92,246,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                     {loading
                        ? 'Connecting...'
                        : isSignup
                          ? 'Create account'
                          : 'Enter the engine'}

                     {!loading && (
                        <ArrowRight
                           size={17}
                           className="transition-transform group-hover:translate-x-1"
                        />
                     )}
                  </button>
               </form>

               {/* Switch auth mode */}
               <p className="mt-7 text-center text-sm text-white/40">
                  {isSignup
                     ? 'Already have an account?'
                     : "Don't have an account?"}{' '}
                  <button
                     type="button"
                     onClick={() =>
                        onModeChange(isSignup ? 'login' : 'signup')
                     }
                     className="font-semibold text-purple-400 transition hover:text-purple-300 cursor-pointer"
                  >
                     {isSignup ? 'Log in' : 'Sign up'}
                  </button>
               </p>
            </div>
         </div>
      </div>
   );
}

function getFirebaseErrorMessage(code: string) {
   switch (code) {
      case 'auth/email-already-in-use':
         return 'An account already exists with this email address.';

      case 'auth/invalid-email':
         return 'Please enter a valid email address.';

      case 'auth/weak-password':
         return 'Your password should be at least 6 characters.';

      case 'auth/invalid-credential':
      case 'auth/wrong-password':
         return 'Incorrect email or password.';

      case 'auth/user-not-found':
         return 'No account was found with this email address.';

      case 'auth/popup-closed-by-user':
         return 'The authentication window was closed.';

      case 'auth/popup-blocked':
         return 'Your browser blocked the authentication popup.';

      default:
         return 'Something went wrong. Please try again.';
   }
}

function GoogleIcon() {
   return (
      <svg width="18" height="18" viewBox="0 0 24 24">
         <path
            fill="#4285F4"
            d="M21.35 12.27c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.22Z"
         />
         <path
            fill="#34A853"
            d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
         />
         <path
            fill="#FBBC05"
            d="M6.54 13.83A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.83V7.64H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.36l3.24-2.53Z"
         />
         <path
            fill="#EA4335"
            d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.13 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.39l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z"
         />
      </svg>
   );
}