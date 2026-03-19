'use client';

import { useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import {
   signInWithCustomToken,
   signOut,
   onAuthStateChanged,
   User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useFirebaseAuth() {
   const { address, isConnected } = useAccount();
   const { signMessageAsync } = useSignMessage();
   const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
   const [authLoading, setAuthLoading] = useState(false);
   const [authError, setAuthError] = useState('');

   // Listen to Firebase auth state
   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
         setFirebaseUser(user);
      });
      return () => unsubscribe();
   }, []);

   // Auto sign in when wallet connects
   useEffect(() => {
      if (isConnected && address && !firebaseUser) {
         signInWithWallet();
      }
      if (!isConnected && firebaseUser) {
         signOut(auth);
      }
   }, [isConnected, address]);

   const signInWithWallet = async () => {
      if (!address) return;
      setAuthLoading(true);
      setAuthError('');

      try {
         const message = `Sign in to Nebula Engine\nWallet: ${address}\nTimestamp: ${Date.now()}`;

         // Ask user to sign the message with their wallet
         const signature = await signMessageAsync({ message });

         // Send to our API to verify + get Firebase token
         const res = await fetch('/api/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, signature, message }),
         });

         const data = await res.json();

         if (!res.ok) throw new Error(data.error);

         // Sign into Firebase with the custom token
         await signInWithCustomToken(auth, data.token);
      } catch (err: any) {
         console.error('Firebase auth error:', err);
         setAuthError(err.message ?? 'Authentication failed');
      } finally {
         setAuthLoading(false);
      }
   };

   return { firebaseUser, authLoading, authError, signInWithWallet };
}
