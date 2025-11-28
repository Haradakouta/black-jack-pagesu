import { Card, Suit } from './types';
import { SUITS, RANKS } from './constants';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      let value = parseInt(rank);
      if (rank === 'A') value = 11;
      if (['J', 'Q', 'K'].includes(rank)) value = 10;

      deck.push({
        id: `${rank}-${suit}-${Math.random().toString(36).substr(2, 9)}`,
        suit,
        rank,
        value,
      });
    });
  });
  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const calculateScore = (hand: Card[]): number => {
  let score = 0;
  let aces = 0;

  hand.forEach((card) => {
    if (card.isHidden) return; // Don't count hidden cards for display
    score += card.value;
    if (card.rank === 'A') aces += 1;
  });

  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }

  return score;
};
