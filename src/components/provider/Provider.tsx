'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { config } from '@/lib/wagmi';
import { useWalletSync } from '@/hooks/useWalletSync';
import { useAccount } from 'wagmi';

import UsernameModal from '@/components/modals/UsernameModal';
import { AuthProvider } from '@/context/AuthContext';

const queryClient = new QueryClient();

function WalletSync({ children }: { children: React.ReactNode }) {
   const { address } = useAccount();
   const { needsUsername, setNeedsUsername, checked } = useWalletSync();


   return (
      <>
         {children}

         {checked && needsUsername && address && (
            <UsernameModal
               address={address}
               onComplete={() => setNeedsUsername(false)}
               onClose={() => setNeedsUsername(false)}
            />
         )}
      </>
   );
}

export default function Providers({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <AuthProvider>
         <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
               <RainbowKitProvider
                  theme={darkTheme({
                     accentColor: '#7c3aed',
                     accentColorForeground: 'white',
                     borderRadius: 'medium',
                  })}
                  showRecentTransactions={false}
               >
                  <WalletSync>{children}</WalletSync>
               </RainbowKitProvider>
            </QueryClientProvider>
         </WagmiProvider>
      </AuthProvider>
   );
}