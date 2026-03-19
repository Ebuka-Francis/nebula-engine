'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { getOrCreatePlayer } from '@/lib/playerService';

export function useWalletSync() {
   const { address, isConnected } = useAccount();
   const [needsUsername, setNeedsUsername] = useState(false);

   useEffect(() => {
      if (isConnected && address) {
         getOrCreatePlayer(address)
            .then((player) => {
               if (!player.username) {
                  setNeedsUsername(true);
               }
            })
            .catch(console.error);
      }

      if (!isConnected) {
         setNeedsUsername(false);
      }
   }, [isConnected, address]);

   return { needsUsername, setNeedsUsername };
}
