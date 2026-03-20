export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank =
   | '2'
   | '3'
   | '4'
   | '5'
   | '6'
   | '7'
   | '8'
   | '9'
   | '10'
   | 'J'
   | 'Q'
   | 'K'
   | 'A';

export interface Card {
   rank: Rank;
   suit: Suit;
   value: number; // 2-14 (Ace = 14)
}

const RANKS: Rank[] = [
   '2',
   '3',
   '4',
   '5',
   '6',
   '7',
   '8',
   '9',
   '10',
   'J',
   'Q',
   'K',
   'A',
];
const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const VALUES: Record<Rank, number> = {
   '2': 2,
   '3': 3,
   '4': 4,
   '5': 5,
   '6': 6,
   '7': 7,
   '8': 8,
   '9': 9,
   '10': 10,
   J: 11,
   Q: 12,
   K: 13,
   A: 14,
};

export function createDeck(): Card[] {
   const deck: Card[] = [];
   for (const suit of SUITS) {
      for (const rank of RANKS) {
         deck.push({ rank, suit, value: VALUES[rank] });
      }
   }
   return deck;
}

// Fisher-Yates shuffle
export function shuffleDeck(deck: Card[]): Card[] {
   const shuffled = [...deck];
   for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
   }
   return shuffled;
}
