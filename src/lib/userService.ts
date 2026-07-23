import {
   doc,
   getDoc,
   setDoc,
   updateDoc,
   serverTimestamp,
} from 'firebase/firestore';

import { db } from './firebase';

export interface UserProfile {
   uid: string;
   email: string | null;
   username: string;
   displayName: string;
   photoURL: string | null;
   bio: string;
   country: string;
   walletAddress: string | null;
   joinedAt?: unknown;

   stats: {
      tournaments: number;
      wins: number;
      earnings: number;
   };
}

export async function createUserProfile(
   uid: string,
   data: {
      email: string | null;
      displayName?: string;
      photoURL?: string | null;
   }
) {
   const userRef = doc(db, 'users', uid);

   await setDoc(userRef, {
      uid,
      email: data.email,
      username: '',
      displayName: data.displayName ?? '',
      photoURL: data.photoURL ?? null,
      bio: '',
      country: '',
      walletAddress: null,

      joinedAt: serverTimestamp(),

      stats: {
         tournaments: 0,
         wins: 0,
         earnings: 0,
      },
   });
}

export async function getUserProfile(
   uid: string
): Promise<UserProfile | null> {
   const userSnapshot = await getDoc(doc(db, 'users', uid));

   if (!userSnapshot.exists()) {
      return null;
   }

   return userSnapshot.data() as UserProfile;
}

export async function updateUserProfile(
   uid: string,
   data: Partial<UserProfile>
) {
   await updateDoc(doc(db, 'users', uid), data);
}