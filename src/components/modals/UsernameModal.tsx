'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Check, X, Loader } from 'lucide-react';
import { setUsername, isUsernameTaken } from '@/lib/playerService';

interface Props {
   address: string;
   onComplete: (username: string) => void;
}

export default function UsernameModal({ address, onComplete }: Props) {
   const [value, setValue] = useState('');
   const [error, setError] = useState('');
   const [checking, setChecking] = useState(false);
   const [saving, setSaving] = useState(false);
   const [available, setAvailable] = useState<boolean | null>(null);

   const validate = (val: string) => {
      if (val.length < 3) return 'Username must be at least 3 characters';
      if (val.length > 20) return 'Username must be under 20 characters';
      if (!/^[a-zA-Z0-9_]+$/.test(val))
         return 'Only letters, numbers and underscores allowed';
      return '';
   };

   const handleChange = async (val: string) => {
      setValue(val);
      setAvailable(null);
      setError('');

      const validationError = validate(val);
      if (validationError) {
         setError(validationError);
         return;
      }

      // Debounce check
      setChecking(true);
      setTimeout(async () => {
         const taken = await isUsernameTaken(val);
         setAvailable(!taken);
         if (taken) setError('Username already taken');
         setChecking(false);
      }, 600);
   };

   const handleSubmit = async () => {
      const validationError = validate(value);
      if (validationError) {
         setError(validationError);
         return;
      }
      if (!available) return;

      setSaving(true);
      try {
         await setUsername(address, value.toLowerCase().trim());
         onComplete(value.toLowerCase().trim());
      } catch (err) {
         setError('Something went wrong. Try again.');
      } finally {
         setSaving(false);
      }
   };

   return (
      <AnimatePresence>
         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            style={{
               backgroundColor: 'rgba(0,0,0,0.8)',
               backdropFilter: 'blur(8px)',
            }}
         >
            <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 24 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 24 }}
               transition={{ duration: 0.35, ease: 'easeOut' }}
               className="w-full max-w-md bg-[#111114] border border-white/[0.08] rounded-2xl p-8 shadow-2xl"
            >
               {/* Icon */}
               <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center mx-auto mb-6">
                  <User size={24} className="text-purple-400" />
               </div>

               {/* Heading */}
               <h2 className="text-white font-black text-2xl text-center tracking-tight mb-1">
                  Pick your username
               </h2>
               <p className="text-white/40 text-sm text-center mb-8">
                  This is how other players will see you at the table.
               </p>

               {/* Input */}
               <div className="flex flex-col gap-2 mb-6">
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">
                        @
                     </span>
                     <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="your_username"
                        maxLength={20}
                        className="w-full bg-[#0d0d0f] border border-white/[0.08] rounded-xl pl-8 pr-10 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/60 transition-all duration-200"
                     />
                     {/* Status icon */}
                     <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {checking && (
                           <Loader
                              size={14}
                              className="text-white/30 animate-spin"
                           />
                        )}
                        {!checking && available === true && (
                           <Check size={14} className="text-emerald-400" />
                        )}
                        {!checking && available === false && (
                           <X size={14} className="text-red-400" />
                        )}
                     </div>
                  </div>

                  {/* Error / available message */}
                  <AnimatePresence mode="wait">
                     {error && (
                        <motion.p
                           key="error"
                           initial={{ opacity: 0, y: -4 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0 }}
                           className="text-red-400 text-xs px-1"
                        >
                           {error}
                        </motion.p>
                     )}
                     {!error && available === true && (
                        <motion.p
                           key="available"
                           initial={{ opacity: 0, y: -4 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0 }}
                           className="text-emerald-400 text-xs px-1"
                        >
                           ✓ Username available
                        </motion.p>
                     )}
                  </AnimatePresence>
               </div>

               {/* Wallet address info */}
               <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  <span className="text-white/30 text-xs font-mono">
                     {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
               </div>

               {/* Submit */}
               <motion.button
                  onClick={handleSubmit}
                  disabled={!available || saving || checking}
                  whileHover={{
                     scale: available ? 1.02 : 1,
                     boxShadow: available
                        ? '0 0 30px rgba(139,92,246,0.5)'
                        : 'none',
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
               >
                  {saving ? (
                     <span className="flex items-center justify-center gap-2">
                        <Loader size={14} className="animate-spin" />
                        Saving...
                     </span>
                  ) : (
                     'Set Username & Enter'
                  )}
               </motion.button>

               <p className="text-white/20 text-[10px] text-center mt-4">
                  Username can be changed later in your profile settings.
               </p>
            </motion.div>
         </motion.div>
      </AnimatePresence>
   );
}
