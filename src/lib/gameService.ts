import { httpsCallable } from 'firebase/functions';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';

// Join a tournament — adds player to registrations subcollection
export async function joinTournament(
   tournamentId: string,
   address: string,
   username: string,
): Promise<void> {
   const registrationRef = doc(
      db,
      'tournaments',
      tournamentId,
      'registrations',
      address,
   );

   // Check if already joined
   const existing = await getDoc(registrationRef);
   if (existing.exists()) {
      throw new Error('You have already joined this tournament.');
   }

   await setDoc(registrationRef, {
      address,
      username,
      joinedAt: serverTimestamp(),
      status: 'registered',
   });
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
