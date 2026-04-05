'use client';

import { useEffect, useRef } from 'react';

export function useAutoFold(
   tournamentId: string,
   isMyTurn: boolean,
   turnDeadline: number | null,
   playerAddress: string,
   onFold: () => Promise<void>,
) {
   const timerRef = useRef<NodeJS.Timeout | null>(null);

   useEffect(() => {
      if (timerRef.current) {
         clearTimeout(timerRef.current);
         timerRef.current = null;
      }

      if (!isMyTurn || !turnDeadline || !playerAddress) return;

      const timeLeft = turnDeadline - Date.now();

      if (timeLeft < 5000) {
         console.warn(`Skipping stale deadline — timeLeft: ${timeLeft}ms`);
         return;
      }

      console.log(`Auto-fold timer set for ${Math.round(timeLeft / 1000)}s`);

      timerRef.current = setTimeout(async () => {
         console.log('Turn timer expired — auto folding...');
         try {
            await onFold();
         } catch (err) {
            console.error('Auto-fold failed:', err);
         }
      }, timeLeft);

      return () => {
         if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
         }
      };
   }, [isMyTurn, turnDeadline, playerAddress, onFold]);
}
