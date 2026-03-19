import { Timestamp } from 'firebase/firestore';

// ─── Tournament ───────────────────────────────────────
export type TournamentStatus = 'live' | 'upcoming' | 'ended';

export interface Tournament {
   id: string;
   name: string;
   type: string;
   status: TournamentStatus;
   entryFee: number;
   prizePool: number;
   maxPlayers: number;
   currentPlayers: number;
   startTime: Timestamp;
   creatorAddress: string;
   sideBetting: boolean;
   blindDuration: string;
   startingStack: number;
   payoutStructure: number[];
   createdAt: Timestamp;
}

// For creating — no id yet, Firestore generates it
export type CreateTournamentInput = Omit<
   Tournament,
   'id' | 'createdAt' | 'currentPlayers'
>;

// ─── Player ───────────────────────────────────────────
export interface Player {
   address: string;
   tournamentsWon: number;
   username: string;
   tournamentsPlayed: number;
   totalEarnings: number;
   winRate: number;
   joinedAt: Timestamp;
}

// ─── Payout ───────────────────────────────────────────
export interface Payout {
   id: string;
   tournamentId: string;
   tournamentName: string;
   winnerAddress: string;
   amount: number;
   timestamp: Timestamp;
}
