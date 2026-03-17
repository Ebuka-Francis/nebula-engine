'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, base } from 'wagmi/chains';

export const config = getDefaultConfig({
   appName: 'Nebula-Engine',
   projectId: '383e3811ae3bacb676104f4c75d570fe',
   chains: [mainnet, polygon, arbitrum, base],
   ssr: true,
});
