'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useFirebaseAuth() {
   const { isConnected } = useAccount();

   useEffect(() => {
      // Sign in anonymously as soon as wallet connects
      if (isConnected && !auth.currentUser) {
         signInAnonymously(auth).catch(console.error);
      }

      // Sign out when wallet disconnects
      if (!isConnected && auth.currentUser) {
         signOut(auth).catch(console.error);
      }
   }, [isConnected]);
}
