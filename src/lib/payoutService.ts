import {
   collection,
   query,
   where,
   orderBy,
   onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Payout } from '../../types';

// Real-time recent payouts for a specific wallet
export function subscribeToPayouts(
   address: string,
   callback: (payouts: Payout[]) => void,
) {
   const payoutsRef = collection(db, 'payouts');
   const q = query(
      payoutsRef,
      where('winnerAddress', '==', address),
      orderBy('timestamp', 'desc'),
   );

   return onSnapshot(q, (snapshot) => {
      const payouts = snapshot.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
      })) as Payout[];
      callback(payouts);
   });
}
