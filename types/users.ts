type Timestamp = Date;

export interface UserProfile {
   uid: string;

   // Identity
   username: string;
   displayName?: string;
   email?: string;
   photoURL?: string;   

   // Wallet
   walletAddress?: string;

   // Profile
   bio?: string;
   memberSince: Timestamp;

   // Stats
   stats: {
      tournaments: number;
      wins: number;
      totalWinnings: number;
      winRate: number;
      predictions: number;
      bountiesCompleted: number;
   };

   // Activity
   recentActivity: UserActivity[];

   // Metadata
   createdAt: Timestamp;
   updatedAt: Timestamp;
}

interface UserActivity {
   id: string;
   type:
      | 'tournament'
      | 'prediction'
      | 'bounty'
      | 'reward';

   title: string;
   description?: string;

   amount?: number;
   currency?: string;

   createdAt: Timestamp;
}