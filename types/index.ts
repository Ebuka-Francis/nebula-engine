import { Timestamp } from 'firebase/firestore';
import { Card } from '@/lib/poker/deck';

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

export interface GamePlayer {
   isSmallBlind: any;
   isBigBlind: any;
   address: string;
   username?: string;
   chips: number;
   currentBet?: number;
   status?: 'active' | 'folded' | 'eliminated' | 'all-in' | 'sitting-out';
   isDealer?: boolean;
   lastAction?: string;
   lastActionAmount?: number;
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

export type GamePhase =
   | 'waiting' // waiting for players to join
   | 'starting' // countdown before first hand
   | 'preflop' // hole cards dealt, first betting round
   | 'flop' // 3 community cards
   | 'turn' // 4th community card
   | 'river' // 5th community card
   | 'showdown' // reveal cards + winner
   | 'finished'; // tournament over

export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'all-in';
export type PlayerStatus =
   | 'active'
   | 'folded'
   | 'all-in'
   | 'sitting-out'
   | 'eliminated';

export interface GameState {
   tournamentId: string;
   phase: GamePhase;
   players: Record<string, GamePlayer>; // keyed by wallet address
   communityCards: Card[];
   pot: number;
   sidePots: { amount: number; eligiblePlayers: string[] }[];
   currentTurn: string | null; // wallet address whose turn it is
   dealerIndex: number;
   smallBlind: number;
   bigBlind: number;
   currentBet: number;
   handNumber: number;
   turnDeadline: number | null; // unix timestamp when turn expires
   winners:
      | {
           address: string;
           amount: number;
           hand: string;
        }[]
      | null;
   lastUpdated: number;
}
