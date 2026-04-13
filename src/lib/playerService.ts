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

export async function getPlayer(address: string): Promise<Player | null> {
   const playerRef = doc(db, 'players', address.toLowerCase());
   const snap = await getDoc(playerRef);
   return snap.exists() ? (snap.data() as Player) : null;
}

// Update username
export async function setUsername(
   address: string,
   username: string,
): Promise<void> {
   const normalizedAddress = address.toLowerCase();
   const playerRef = doc(db, 'players', normalizedAddress);
   const cleanUsername = username.toLowerCase().trim();

   try {
      const playerSnap = await getDoc(playerRef);

      if (playerSnap.exists()) {
         // CASE 1: User already exists.
         // We ONLY update the username so we don't touch their stats.
         await updateDoc(playerRef, {
            username: cleanUsername,
         });
         console.log('Username updated successfully.');
      } else {
         // CASE 2: New user.
         // Create the full document with starting stats.
         await setDoc(playerRef, {
            address: normalizedAddress,
            username: cleanUsername,
            tournamentsWon: 0,
            tournamentsPlayed: 0,
            totalEarnings: 0,
            winRate: 0,
            joinedAt: serverTimestamp(),
         });
         console.log('New player profile created.');
      }
   } catch (error) {
      console.error('Error setting username:', error);
      throw error;
   }
}

export async function createPlayerIfNotExists(address: string): Promise<void> {
   const playerRef = doc(db, 'players', address);
   await setDoc(
      playerRef,
      {
         address: address.toLowerCase(),
         createdAt: serverTimestamp(),
      },
      { merge: true },
   ); // merge so existing data is not overwritten
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
