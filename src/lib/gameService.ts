import { httpsCallable } from 'firebase/functions';
import {
   doc,
   setDoc,
   getDoc,
   serverTimestamp,
   increment,
   updateDoc,
   runTransaction,
} from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';

// Join a tournament — adds player to registrations subcollection

export async function joinTournament(
   tournamentId: string,
   address: string,
   username: string,
): Promise<void> {
   const tournamentRef = doc(db, 'tournaments', tournamentId);
   const registrationRef = doc(
      db,
      'tournaments',
      tournamentId,
      'registrations',
      address.toLowerCase(),
   );

   try {
      await runTransaction(db, async (transaction) => {
         const tournamentSnap = await transaction.get(tournamentRef);
         const registrationSnap = await transaction.get(registrationRef);

         if (!tournamentSnap.exists()) {
            throw new Error('Tournament does not exist.');
         }

         const tournamentData = tournamentSnap.data();

         // FIX: Ensure currentPlayers is treated as a number
         const currentCount = Number(tournamentData.currentPlayers || 0);
         const maxPlayers = Number(tournamentData.maxPlayers || 10);

         if (registrationSnap.exists()) {
            throw new Error('You have already joined this tournament.');
         }

         if (currentCount >= maxPlayers) {
            throw new Error('Tournament is full.');
         }

         // 1. Create registration
         transaction.set(registrationRef, {
            address: address.toLowerCase(),
            username,
            joinedAt: serverTimestamp(),
            status: 'registered',
         });

         const newCount = (tournamentData.currentPlayers || 0) + 1;

         transaction.update(tournamentRef, {
            currentPlayers: increment(1), // Let Firebase handle the math
            lastUpdated: Date.now(),
         });
      });
   } catch (error: any) {
      console.error('Join Transaction Failed:', error.message);
      throw error;
   }
}

// Start the game — calls Cloud Function
export async function startGame(tournamentId: string): Promise<void> {
   const startGameFn = httpsCallable(functions, 'startGame');
   const result = await startGameFn({ tournamentId });
   console.log('Game started:', result.data);
}

// Player action — calls Cloud Function
export async function sendPlayerAction(
   tournamentId: string,
   action: string,
   amount?: number,
): Promise<void> {
   const playerActionFn = httpsCallable(functions, 'playerAction');
   await playerActionFn({ tournamentId, action, amount });
}
