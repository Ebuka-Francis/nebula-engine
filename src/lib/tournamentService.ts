import {
   collection,
   addDoc,
   getDocs,
   onSnapshot,
   serverTimestamp,
   query,
   orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Tournament, CreateTournamentInput } from '../../types';

const tournamentsRef = collection(db, 'tournaments');

// Create a new tournament
export async function createTournament(
   data: CreateTournamentInput,
): Promise<string> {
   const docRef = await addDoc(tournamentsRef, {
      ...data,
      currentPlayers: 0,
      createdAt: serverTimestamp(),
   });
   return docRef.id;
}

// Real-time tournaments listener
export function subscribeToTournaments(
   callback: (tournaments: Tournament[]) => void,
) {
   const q = query(tournamentsRef, orderBy('createdAt', 'desc'));
   return onSnapshot(q, (snapshot) => {
      const tournaments = snapshot.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
      })) as Tournament[];
      callback(tournaments);
   });
}
