import { getContract, parseUnits, formatUnits } from 'viem';
import { useWalletClient, usePublicClient } from 'wagmi';

// Replace with your deployed contract address
export const ESCROW_CONTRACT_ADDRESS = '0x...' as `0x${string}`;

// USDC contract address (Polygon mainnet)
export const USDC_ADDRESS =
   '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' as `0x${string}`;

export const ESCROW_ABI = [
   {
      name: 'createTournament',
      type: 'function',
      inputs: [
         { name: 'tournamentId', type: 'string' },
         { name: 'entryFee', type: 'uint256' },
         { name: 'sponsoredPrizePool', type: 'uint256' },
         { name: 'payoutPercentages', type: 'uint256[]' },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
   },
   {
      name: 'joinTournament',
      type: 'function',
      inputs: [{ name: 'tournamentId', type: 'string' }],
      outputs: [],
      stateMutability: 'nonpayable',
   },
   {
      name: 'startTournament',
      type: 'function',
      inputs: [{ name: 'tournamentId', type: 'string' }],
      outputs: [],
      stateMutability: 'nonpayable',
   },
   {
      name: 'claimPayout',
      type: 'function',
      inputs: [{ name: 'tournamentId', type: 'string' }],
      outputs: [],
      stateMutability: 'nonpayable',
   },
   {
      name: 'cancelTournament',
      type: 'function',
      inputs: [{ name: 'tournamentId', type: 'string' }],
      outputs: [],
      stateMutability: 'nonpayable',
   },
   {
      name: 'claimRefund',
      type: 'function',
      inputs: [{ name: 'tournamentId', type: 'string' }],
      outputs: [],
      stateMutability: 'nonpayable',
   },
   {
      name: 'getTournamentInfo',
      type: 'function',
      inputs: [{ name: 'tournamentId', type: 'string' }],
      outputs: [
         { name: 'creator', type: 'address' },
         { name: 'entryFee', type: 'uint256' },
         { name: 'prizePool', type: 'uint256' },
         { name: 'totalDeposited', type: 'uint256' },
         { name: 'status', type: 'uint8' },
         { name: 'playerCount', type: 'uint256' },
         { name: 'winners', type: 'address[]' },
         { name: 'payoutPercentages', type: 'uint256[]' },
      ],
      stateMutability: 'view',
   },
   {
      name: 'hasPlayerJoined',
      type: 'function',
      inputs: [
         { name: 'tournamentId', type: 'string' },
         { name: 'player', type: 'address' },
      ],
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'view',
   },
] as const;

export const USDC_ABI = [
   {
      name: 'approve',
      type: 'function',
      inputs: [
         { name: 'spender', type: 'address' },
         { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
   },
   {
      name: 'allowance',
      type: 'function',
      inputs: [
         { name: 'owner', type: 'address' },
         { name: 'spender', type: 'address' },
      ],
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
   },
   {
      name: 'balanceOf',
      type: 'function',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
   },
] as const;

// Convert USDC amount (human readable) to contract units (6 decimals)
export function toUSDC(amount: number): bigint {
   return parseUnits(amount.toString(), 6);
}

// Convert contract units to human readable
export function fromUSDC(amount: bigint): number {
   return Number(formatUnits(amount, 6));
}
