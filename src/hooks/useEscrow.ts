'use client';

import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import {
   ESCROW_CONTRACT_ADDRESS,
   ESCROW_ABI,
   USDC_ADDRESS,
   USDC_ABI,
   toUSDC,
} from '@/lib/escrow';

export function useEscrow() {
   const { data: walletClient } = useWalletClient();
   const publicClient = usePublicClient();
   const { address } = useAccount();

   // Approve USDC spending
   const approveUSDC = async (amount: number) => {
      if (!walletClient || !address) throw new Error('Wallet not connected');

      const hash = await walletClient.writeContract({
         address: USDC_ADDRESS,
         abi: USDC_ABI,
         functionName: 'approve',
         args: [ESCROW_CONTRACT_ADDRESS, toUSDC(amount)],
      });

      await publicClient!.waitForTransactionReceipt({ hash });
      return hash;
   };

   // Create tournament on-chain
   const createTournamentOnChain = async (
      tournamentId: string,
      entryFee: number,
      sponsoredPrizePool: number,
      payoutPercentages: number[],
   ) => {
      if (!walletClient) throw new Error('Wallet not connected');

      // If sponsored prize pool, approve first
      if (sponsoredPrizePool > 0) {
         await approveUSDC(sponsoredPrizePool);
      }

      const hash = await walletClient.writeContract({
         address: ESCROW_CONTRACT_ADDRESS,
         abi: ESCROW_ABI,
         functionName: 'createTournament',
         args: [
            tournamentId,
            toUSDC(entryFee),
            toUSDC(sponsoredPrizePool),
            payoutPercentages.map(BigInt),
         ],
      });

      await publicClient!.waitForTransactionReceipt({ hash });
      return hash;
   };

   // Join tournament on-chain (pay entry fee)
   const joinTournamentOnChain = async (
      tournamentId: string,
      entryFee: number,
   ) => {
      if (!walletClient) throw new Error('Wallet not connected');

      // Approve entry fee first
      if (entryFee > 0) {
         await approveUSDC(entryFee);
      }

      const hash = await walletClient.writeContract({
         address: ESCROW_CONTRACT_ADDRESS,
         abi: ESCROW_ABI,
         functionName: 'joinTournament',
         args: [tournamentId],
      });

      await publicClient!.waitForTransactionReceipt({ hash });
      return hash;
   };

   // Claim payout after tournament ends
   const claimPayout = async (tournamentId: string) => {
      if (!walletClient) throw new Error('Wallet not connected');

      const hash = await walletClient.writeContract({
         address: ESCROW_CONTRACT_ADDRESS,
         abi: ESCROW_ABI,
         functionName: 'claimPayout',
         args: [tournamentId],
      });

      await publicClient!.waitForTransactionReceipt({ hash });
      return hash;
   };

   // Get tournament on-chain info
   const getTournamentInfo = async (tournamentId: string) => {
      if (!publicClient) throw new Error('No public client');

      const result = await publicClient.readContract({
         address: ESCROW_CONTRACT_ADDRESS,
         abi: ESCROW_ABI,
         functionName: 'getTournamentInfo',
         args: [tournamentId],
      });

      return result;
   };

   // Check if player joined on-chain
   const hasJoinedOnChain = async (
      tournamentId: string,
      playerAddress: string,
   ) => {
      if (!publicClient) return false;

      return publicClient.readContract({
         address: ESCROW_CONTRACT_ADDRESS,
         abi: ESCROW_ABI,
         functionName: 'hasPlayerJoined',
         args: [tournamentId, playerAddress as `0x${string}`],
      });
   };

   return {
      approveUSDC,
      createTournamentOnChain,
      joinTournamentOnChain,
      claimPayout,
      getTournamentInfo,
      hasJoinedOnChain,
   };
}
