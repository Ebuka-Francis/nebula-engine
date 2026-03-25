'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { getOrCreatePlayer } from '@/lib/playerService';

export function useWalletSync() {
   const { address, isConnected } = useAccount();
   const [needsUsername, setNeedsUsername] = useState(false);
   const [checked, setChecked] = useState(false); // ← tracks if check is done

   useEffect(() => {
      if (isConnected && address) {
         getOrCreatePlayer(address.toLowerCase())
            .then((player) => {
               // Only show modal if username is empty
               setNeedsUsername(
                  !player.username || player.username.trim() === '',
               );
               setChecked(true);
            })
            .catch((err) => {
               console.error('WalletSync error:', err);
               setChecked(true);
            });
      }

      if (!isConnected) {
         setNeedsUsername(false);
         setChecked(false);
      }
   }, [isConnected, address]);

   return { needsUsername, setNeedsUsername, checked };
}
