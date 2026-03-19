import {
   doc,
   getDoc,
   setDoc,
   serverTimestamp,
   collection,
   updateDoc,
   where,
   getDocs,
   query,
} from 'firebase/firestore';
import { db } from './firebase';
import { Player } from '../../types';

// Auto-create player doc if it doesn't exist
export async function getOrCreatePlayer(address: string): Promise<Player> {
   const playerRef = doc(db, 'players', address);
   const playerSnap = await getDoc(playerRef);

   if (playerSnap.exists()) {
      return playerSnap.data() as Player;
   }

   const newPlayer: Omit<Player, 'joinedAt'> & { joinedAt: any } = {
      address,
      username: '',
      tournamentsWon: 0,
      tournamentsPlayed: 0,
      totalEarnings: 0,
      winRate: 0,
      joinedAt: serverTimestamp(),
   };

   await setDoc(playerRef, newPlayer);
   return newPlayer as Player;
}

// Fetch player stats
export async function getPlayerStats(address: string): Promise<Player | null> {
   const playerRef = doc(db, 'players', address);
   const playerSnap = await getDoc(playerRef);
   if (!playerSnap.exists()) return null;
   return playerSnap.data() as Player;
}

// Update username
export async function setUsername(
   address: string,
   username: string,
): Promise<void> {
   const playerRef = doc(db, 'players', address);
   await updateDoc(playerRef, { username: username.toLowerCase().trim() });
}

// Check if username is already taken
export async function isUsernameTaken(username: string): Promise<boolean> {
   const q = query(
      collection(db, 'players'),
      where('username', '==', username.toLowerCase().trim()),
   );
   const snap = await getDocs(q);
   return !snap.empty;
}
