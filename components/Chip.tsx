import React from 'react';
import { motion } from 'framer-motion';
import { ChipValue } from '../types';

interface ChipProps {
  chip: ChipValue;
  onClick?: () => void;
  disabled?: boolean;
  isBet?: boolean;
}

const Chip: React.FC<ChipProps> = ({ chip, onClick, disabled, isBet }) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative rounded-full 
        flex items-center justify-center 
        font-bold text-white shadow-[0_4px_6px_rgba(0,0,0,0.5),inset_0_-4px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.3)]
        ${chip.color} 
        border-4 border-dashed ${chip.borderColor}
        ${isBet ? 'w-16 h-16 md:w-20 md:h-20 text-sm md:text-base' : 'w-14 h-14 md:w-16 md:h-16 text-xs md:text-sm'}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
        transition-all duration-200
      `}
    >
      <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
      <span className="drop-shadow-md font-serif-display">${chip.value}</span>
    </motion.button>
  );
};

export default Chip;
