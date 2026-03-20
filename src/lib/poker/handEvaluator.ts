import { Card } from './deck';

export type HandRank =
   | 'Royal Flush'
   | 'Straight Flush'
   | 'Four of a Kind'
   | 'Full House'
   | 'Flush'
   | 'Straight'
   | 'Three of a Kind'
   | 'Two Pair'
   | 'One Pair'
   | 'High Card';

export interface HandResult {
   rank: HandRank;
   score: number; // higher = better
   bestCards: Card[];
   description: string;
}

function groupByRank(cards: Card[]): Record<number, Card[]> {
   return cards.reduce(
      (acc, card) => {
         acc[card.value] = acc[card.value] || [];
         acc[card.value].push(card);
         return acc;
      },
      {} as Record<number, Card[]>,
   );
}

function isFlush(cards: Card[]): Card[] | null {
   const suitGroups = cards.reduce(
      (acc, card) => {
         acc[card.suit] = acc[card.suit] || [];
         acc[card.suit].push(card);
         return acc;
      },
      {} as Record<string, Card[]>,
   );

   for (const suit in suitGroups) {
      if (suitGroups[suit].length >= 5) {
         return suitGroups[suit].sort((a, b) => b.value - a.value).slice(0, 5);
      }
   }
   return null;
}

function isStraight(cards: Card[]): Card[] | null {
   const sorted = [...cards].sort((a, b) => b.value - a.value);
   const unique = sorted.filter(
      (c, i, arr) => i === 0 || c.value !== arr[i - 1].value,
   );

   for (let i = 0; i <= unique.length - 5; i++) {
      const slice = unique.slice(i, i + 5);
      if (slice[0].value - slice[4].value === 4) return slice;
   }

   // Wheel straight (A-2-3-4-5)
   const values = unique.map((c) => c.value);
   if (
      values.includes(14) &&
      values.includes(2) &&
      values.includes(3) &&
      values.includes(4) &&
      values.includes(5)
   ) {
      return [
         unique.find((c) => c.value === 5)!,
         unique.find((c) => c.value === 4)!,
         unique.find((c) => c.value === 3)!,
         unique.find((c) => c.value === 2)!,
         unique.find((c) => c.value === 14)!,
      ];
   }

   return null;
}

export function evaluateHand(
   holeCards: Card[],
   communityCards: Card[],
): HandResult {
   const all = [...holeCards, ...communityCards];
   const sorted = [...all].sort((a, b) => b.value - a.value);
   const groups = groupByRank(all);
   const counts = Object.values(groups).sort(
      (a, b) => b.length - a.length || b[0].value - a[0].value,
   );

   const flushCards = isFlush(all);
   const straightCards = isStraight(all);
   const straightFlush = flushCards ? isStraight(flushCards) : null;

   // Royal Flush
   if (straightFlush && straightFlush[0].value === 14) {
      return {
         rank: 'Royal Flush',
         score: 9000,
         bestCards: straightFlush,
         description: 'Royal Flush!',
      };
   }

   // Straight Flush
   if (straightFlush) {
      return {
         rank: 'Straight Flush',
         score: 8000 + straightFlush[0].value,
         bestCards: straightFlush,
         description: `Straight Flush, ${straightFlush[0].rank} high`,
      };
   }

   // Four of a Kind
   if (counts[0].length === 4) {
      const kicker = sorted.find((c) => c.value !== counts[0][0].value)!;
      return {
         rank: 'Four of a Kind',
         score: 7000 + counts[0][0].value,
         bestCards: [...counts[0], kicker],
         description: `Four ${counts[0][0].rank}s`,
      };
   }

   // Full House
   if (counts[0].length === 3 && counts[1].length >= 2) {
      return {
         rank: 'Full House',
         score: 6000 + counts[0][0].value * 10 + counts[1][0].value,
         bestCards: [...counts[0], ...counts[1].slice(0, 2)],
         description: `Full House, ${counts[0][0].rank}s full of ${counts[1][0].rank}s`,
      };
   }

   // Flush
   if (flushCards) {
      return {
         rank: 'Flush',
         score: 5000 + flushCards[0].value,
         bestCards: flushCards,
         description: `Flush, ${flushCards[0].rank} high`,
      };
   }

   // Straight
   if (straightCards) {
      return {
         rank: 'Straight',
         score: 4000 + straightCards[0].value,
         bestCards: straightCards,
         description: `Straight, ${straightCards[0].rank} high`,
      };
   }

   // Three of a Kind
   if (counts[0].length === 3) {
      const kickers = sorted
         .filter((c) => c.value !== counts[0][0].value)
         .slice(0, 2);
      return {
         rank: 'Three of a Kind',
         score: 3000 + counts[0][0].value,
         bestCards: [...counts[0], ...kickers],
         description: `Three ${counts[0][0].rank}s`,
      };
   }

   // Two Pair
   if (counts[0].length === 2 && counts[1].length === 2) {
      const kicker = sorted.find(
         (c) =>
            c.value !== counts[0][0].value && c.value !== counts[1][0].value,
      )!;
      return {
         rank: 'Two Pair',
         score: 2000 + counts[0][0].value * 10 + counts[1][0].value,
         bestCards: [...counts[0], ...counts[1], kicker],
         description: `Two Pair, ${counts[0][0].rank}s and ${counts[1][0].rank}s`,
      };
   }

   // One Pair
   if (counts[0].length === 2) {
      const kickers = sorted
         .filter((c) => c.value !== counts[0][0].value)
         .slice(0, 3);
      return {
         rank: 'One Pair',
         score: 1000 + counts[0][0].value,
         bestCards: [...counts[0], ...kickers],
         description: `Pair of ${counts[0][0].rank}s`,
      };
   }

   // High Card
   return {
      rank: 'High Card',
      score: sorted[0].value,
      bestCards: sorted.slice(0, 5),
      description: `${sorted[0].rank} high`,
   };
}
