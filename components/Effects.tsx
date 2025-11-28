import React from 'react';
import { motion } from 'framer-motion';
import { GameResult } from '../types';

interface EffectsProps {
  result: GameResult;
  isDoubleDown: boolean;
}

const Effects: React.FC<EffectsProps> = ({ result, isDoubleDown }) => {
  if (!result) return null;

  const getText = () => {
    if (result === 'blackjack') return 'BLACKJACK';
    if (result === 'win' && isDoubleDown) return 'BIG WIN!';
    if (result === 'win') return 'YOU WIN';
    if (result === 'lose') return 'DEALER WINS';
    return 'PUSH';
  };

  const getColor = () => {
    if (result === 'blackjack') return 'text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]';
    if (result === 'win') return isDoubleDown ? 'text-fuchsia-400 drop-shadow-[0_0_25px_rgba(232,121,249,0.8)]' : 'text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]';
    if (result === 'lose') return 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]';
    return 'text-slate-300';
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Background Dim */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Main Text Animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 1.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="relative z-10 text-center"
      >
        <h1 className={`text-6xl md:text-8xl lg:text-9xl font-black font-serif-display tracking-tighter ${getColor()}`}>
          {getText()}
        </h1>
        
        {isDoubleDown && result === 'win' && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mt-4 text-2xl md:text-4xl text-white font-bold tracking-widest uppercase bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            Double Down Paybox
          </motion.div>
        )}
      </motion.div>

      {/* Particle Effects for Blackjack or Big Win */}
      {(result === 'blackjack' || (result === 'win' && isDoubleDown)) && (
        <>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{ 
                x: "50vw", 
                y: "50vh", 
                scale: 0 
              }}
              animate={{ 
                x: `${Math.random() * 100}vw`, 
                y: `${Math.random() * 100}vh`, 
                scale: [0, 1.5, 0],
                opacity: [1, 0]
              }}
              transition={{ 
                duration: 2, 
                ease: "easeOut",
                delay: Math.random() * 0.5,
                repeat: Infinity,
                repeatDelay: 3
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Effects;
