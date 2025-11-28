import React from 'react';
import { motion } from 'framer-motion';
import { Card as CardType } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface PlayingCardProps {
  card: CardType;
  index: number;
  isDealer?: boolean;
}

const PlayingCard: React.FC<PlayingCardProps> = ({ card, index, isDealer }) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  const renderSuitIcon = (className: string) => {
    switch (card.suit) {
      case 'hearts': return <Heart className={`${className} fill-current`} />;
      case 'diamonds': return <Diamond className={`${className} fill-current`} />;
      case 'clubs': return <Club className={`${className} fill-current`} />;
      case 'spades': return <Spade className={`${className} fill-current`} />;
    }
  };

  return (
    <motion.div
      initial={{ 
        x: -200, 
        y: -200, 
        opacity: 0, 
        rotate: Math.random() * 20 - 10 
      }}
      animate={{ 
        x: 0, 
        y: 0, 
        opacity: 1, 
        rotate: card.isHidden ? 0 : Math.random() * 4 - 2 // Slight organic rotation
      }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20, 
        delay: index * 0.15 
      }}
      className="relative w-24 h-36 md:w-32 md:h-48 lg:w-40 lg:h-56 perspective-1000"
      style={{ marginLeft: index === 0 ? 0 : -50 }} // Overlap cards
    >
      <motion.div
        className="w-full h-full relative preserve-3d transition-transform duration-500"
        initial={false}
        animate={{ rotateY: card.isHidden ? 180 : 0 }}
      >
        {/* Front of Card */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col justify-between p-2 md:p-3">
          {/* Top Corner */}
          <div className={`flex flex-col items-center ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            <span className="text-lg md:text-2xl font-bold font-serif-display leading-none">{card.rank}</span>
            {renderSuitIcon("w-4 h-4 md:w-6 md:h-6")}
          </div>

          {/* Center Suit (Large) */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
             {renderSuitIcon("w-16 h-16 md:w-24 md:h-24")}
          </div>

          {/* Bottom Corner (Rotated) */}
          <div className={`flex flex-col items-center transform rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            <span className="text-lg md:text-2xl font-bold font-serif-display leading-none">{card.rank}</span>
            {renderSuitIcon("w-4 h-4 md:w-6 md:h-6")}
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-2xl border-2 border-slate-700 bg-slate-900 overflow-hidden">
          <div className="w-full h-full opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute inset-2 border border-yellow-600/30 rounded-lg flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-yellow-600/50 flex items-center justify-center">
              <span className="text-yellow-600/50 font-serif-display font-bold">RB</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlayingCard;
