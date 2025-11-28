import { ChipValue, Suit } from './types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const CHIPS: ChipValue[] = [
  { value: 10, color: 'bg-blue-600', borderColor: 'border-blue-400' },
  { value: 50, color: 'bg-red-600', borderColor: 'border-red-400' },
  { value: 100, color: 'bg-green-600', borderColor: 'border-green-400' },
  { value: 500, color: 'bg-purple-900', borderColor: 'border-purple-500' },
];

export const INITIAL_BALANCE = 5000;
