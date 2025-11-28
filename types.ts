export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  id: string; // Unique ID for animation keys
  suit: Suit;
  rank: string; // 'A', '2'...'10', 'J', 'Q', 'K'
  value: number;
  isHidden?: boolean;
}

export type GameStatus = 'betting' | 'playing' | 'dealerTurn' | 'gameOver';

export type GameResult = 'win' | 'lose' | 'push' | 'blackjack' | null;

export interface ChipValue {
  value: number;
  color: string;
  borderColor: string;
}
