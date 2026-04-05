import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
console.log('Initializing Firebase with Project ID:', firebaseConfig.projectId);

export const db = getFirestore(app); // ✅ Live Firestore
export const auth = getAuth(app); // ✅ Live Auth
export const functions = getFunctions(app); // starts as live

// ✅ Only connect Functions to emulator in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
   try {
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);
   } catch (e) {
      // Already connected — ignore
   }
}
