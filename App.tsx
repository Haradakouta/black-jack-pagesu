import React, { useState, useEffect, useCallback } from 'react';
import { Card, GameResult, GameStatus } from './types';
import { createDeck, calculateScore } from './utils';
import { INITIAL_BALANCE, CHIPS } from './constants';
import PlayingCard from './components/PlayingCard';
import Chip from './components/Chip';
import Effects from './components/Effects';
import { Coins, Layers, RotateCcw, Hand, Trophy, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  // Game State
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<GameStatus>('betting');
  const [gameResult, setGameResult] = useState<GameResult>(null);
  const [resultMessage, setResultMessage] = useState<string>('');

  // Economy State
  const [balance, setBalance] = useState<number>(INITIAL_BALANCE);
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [isDoubleDown, setIsDoubleDown] = useState<boolean>(false);

  // --- Actions ---

  const handleBet = (amount: number) => {
    // Allow betting even if balance is negative (User Request)
    setBalance(prev => prev - amount);
    setCurrentBet(prev => prev + amount);
  };

  const clearBet = () => {
    setBalance(prev => prev + currentBet);
    setCurrentBet(0);
  };

  const allIn = () => {
    if (balance > 0) {
      const total = balance;
      setCurrentBet(prev => prev + total);
      setBalance(0);
    }
  };

  const dealGame = () => {
    if (currentBet === 0) return;

    const newDeck = createDeck();
    
    // Draw initial cards
    const pCard1 = newDeck.pop()!;
    const dCard1 = newDeck.pop()!;
    const pCard2 = newDeck.pop()!;
    const dCard2 = { ...newDeck.pop()!, isHidden: true }; // Dealer hole card

    setDeck(newDeck);
    setPlayerHand([pCard1, pCard2]);
    setDealerHand([dCard1, dCard2]);
    setGameState('playing');
    setGameResult(null);
    setIsDoubleDown(false);
  };

  const hit = () => {
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    setDeck(newDeck);
    setPlayerHand(prev => [...prev, card]);
  };

  const stand = () => {
    setGameState('dealerTurn');
  };

  const doubleDown = () => {
    // Allow double down even if balance is negative (User Request)
    setBalance(prev => prev - currentBet);
    setCurrentBet(prev => prev * 2);
    setIsDoubleDown(true);
    
    // Deal one card then force stand
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    setDeck(newDeck);
    setPlayerHand(prev => [...prev, card]);
  };

  const resetGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('betting');
    setGameResult(null);
    setIsDoubleDown(false);
    setCurrentBet(0);
  };

  // --- Game Logic Effects ---

  // Check for Player Bust or Blackjack immediately after dealing or hitting
  useEffect(() => {
    if (gameState === 'playing') {
      const score = calculateScore(playerHand);
      
      // Check Instant Blackjack on deal
      if (playerHand.length === 2 && score === 21) {
         stand(); 
         return;
      }

      if (score > 21) {
        setGameState('gameOver');
        setGameResult('lose');
        setResultMessage('Bust! You went over 21.');
      }

      // If Double Down, force stand if not bust
      if (isDoubleDown && playerHand.length === 3 && score <= 21) {
        setTimeout(() => setGameState('dealerTurn'), 1000);
      }
    }
  }, [playerHand, gameState, isDoubleDown]);

  // Dealer Logic
  useEffect(() => {
    if (gameState === 'dealerTurn') {
      let currentDealerHand = [...dealerHand];
      // Reveal hole card
      currentDealerHand[1].isHidden = false;
      setDealerHand([...currentDealerHand]);

      const playDealer = async () => {
        let dScore = calculateScore(currentDealerHand);
        let pScore = calculateScore(playerHand);

        // Player Blackjack handling (3:2)
        if (pScore === 21 && playerHand.length === 2) {
            // Check if dealer also has BJ
            if (dScore === 21 && currentDealerHand.length === 2) {
                setGameResult('push');
                setResultMessage('Push! Both have Blackjack.');
            } else {
                setGameResult('blackjack');
                setResultMessage('Blackjack!');
            }
            setGameState('gameOver');
            return;
        }

        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        
        // Artificial delay for tension
        await delay(800);

        let deckRef = [...deck];
        
        while (dScore < 17) {
            const newCard = deckRef.pop()!;
            currentDealerHand = [...currentDealerHand, newCard];
            setDealerHand([...currentDealerHand]);
            setDeck(deckRef);
            dScore = calculateScore(currentDealerHand);
            await delay(1000);
        }

        determineWinner(pScore, dScore);
      };

      playDealer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  const determineWinner = (pScore: number, dScore: number) => {
    setGameState('gameOver');
    
    if (dScore > 21) {
      setGameResult('win');
      setResultMessage('Dealer Busts! You Win.');
    } else if (pScore > dScore) {
      setGameResult('win');
      setResultMessage('You Win!');
    } else if (dScore > pScore) {
      setGameResult('lose');
      setResultMessage('Dealer Wins.');
    } else {
      setGameResult('push');
      setResultMessage('Push. Money returned.');
    }
  };

  // Payout Logic
  useEffect(() => {
    if (gameState === 'gameOver' && gameResult) {
      if (gameResult === 'win') {
        setBalance(prev => prev + (currentBet * 2));
      } else if (gameResult === 'blackjack') {
        setBalance(prev => prev + (currentBet * 2.5)); // 3:2 payout (bet + 1.5*bet)
      } else if (gameResult === 'push') {
        setBalance(prev => prev + currentBet);
      }
      // Lose: money already deducted
    }
  }, [gameState, gameResult]);

  // --- Rendering Helpers ---

  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      
      {/* Table Surface / Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-full h-full bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-30 mix-blend-overlay"></div>
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-900/40 to-transparent"></div>
        
        {/* Decorative Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-2 border-emerald-500/10 rounded-full"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl p-4 md:p-6 flex justify-between items-center glass-panel">
        <div className="flex items-center gap-2">
            <div className="bg-yellow-500/20 p-2 rounded-lg border border-yellow-500/30">
                <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <h1 className="text-xl md:text-2xl font-serif-display font-bold tracking-wider text-yellow-500 bg-clip-text">
                ROYALE BJ
            </h1>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Balance</span>
                <span className={`text-lg md:text-xl font-mono font-bold ${balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>${balance.toLocaleString()}</span>
            </div>
            <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Current Bet</span>
                <span className="text-lg md:text-xl font-mono font-bold text-yellow-400">${currentBet.toLocaleString()}</span>
            </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="relative z-10 flex-1 w-full max-w-5xl flex flex-col justify-center items-center p-4">
        
        {/* Dealer Hand */}
        <div className="w-full flex flex-col items-center mb-8 md:mb-16 min-h-[200px]">
           <div className="flex items-center gap-2 mb-2 opacity-70">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-slate-300">Dealer</span>
              {gameState !== 'betting' && (
                <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">
                    {gameState === 'playing' ? '?' : dealerScore}
                </span>
              )}
           </div>
           <div className="flex justify-center -space-x-12 md:-space-x-20">
              <AnimatePresence>
                {dealerHand.map((card, index) => (
                    <PlayingCard key={card.id} card={card} index={index} isDealer />
                ))}
              </AnimatePresence>
              {dealerHand.length === 0 && (
                  <div className="w-24 h-36 md:w-32 md:h-48 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center opacity-20">
                      <span className="font-serif-display text-4xl">Royale</span>
                  </div>
              )}
           </div>
        </div>

        {/* Center Info / Result */}
        <AnimatePresence>
            {gameState === 'gameOver' && (
                <Effects result={gameResult} isDoubleDown={isDoubleDown} />
            )}
        </AnimatePresence>

        {/* Player Hand */}
        <div className="w-full flex flex-col items-center mb-8 min-h-[200px]">
           <div className="flex justify-center -space-x-12 md:-space-x-20">
              <AnimatePresence>
                {playerHand.map((card, index) => (
                    <PlayingCard key={card.id} card={card} index={index} />
                ))}
              </AnimatePresence>
               {playerHand.length === 0 && (
                  <div className="w-24 h-36 md:w-32 md:h-48 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center opacity-20">
                       <span className="font-serif-display text-4xl">Place Bet</span>
                  </div>
              )}
           </div>
           <div className="flex items-center gap-2 mt-4 opacity-90">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-slate-300">Player</span>
              {gameState !== 'betting' && (
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${playerScore > 21 ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-emerald-900/50 border-emerald-500 text-emerald-200'}`}>
                    {playerScore}
                </div>
              )}
           </div>
        </div>

      </main>

      {/* Footer Controls */}
      <footer className="relative z-20 w-full glass-panel-top p-6 md:p-8 bg-black/60 backdrop-blur-xl border-t border-white/10">
        
        {/* Betting Interface */}
        {gameState === 'betting' && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                {CHIPS.map((chip) => (
                    <Chip 
                        key={chip.value} 
                        chip={chip} 
                        onClick={() => handleBet(chip.value)}
                        // removed disabled check for negative balance
                    />
                ))}
            </div>

            <div className="flex items-center gap-4 w-full max-w-lg">
                <button 
                    onClick={clearBet}
                    className="flex-1 py-3 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold uppercase tracking-wider text-sm transition-colors border border-slate-600"
                >
                    Clear
                </button>
                <div className="flex flex-col items-center px-6 min-w-[120px]">
                    <span className="text-xs text-slate-400 uppercase">Bet</span>
                    <span className="text-2xl font-mono font-bold text-white">${currentBet}</span>
                </div>
                <button 
                    onClick={allIn}
                    className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-amber-900/20 border border-amber-500/50"
                >
                    All In
                </button>
            </div>

            <button
                onClick={dealGame}
                disabled={currentBet === 0}
                className={`
                    w-full max-w-md py-4 rounded-xl font-serif-display text-xl font-bold tracking-widest uppercase shadow-2xl
                    transition-all duration-300 transform
                    ${currentBet > 0 
                        ? 'bg-emerald-600 hover:bg-emerald-500 hover:scale-105 text-white shadow-emerald-900/50' 
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
                `}
            >
                Deal Cards
            </button>
          </motion.div>
        )}

        {/* Gameplay Controls */}
        {gameState === 'playing' && (
           <div className="flex justify-center gap-4">
              <ControlBtn 
                onClick={hit} 
                icon={<Layers className="w-5 h-5" />} 
                label="Hit" 
                color="bg-slate-700 hover:bg-slate-600"
              />
              <ControlBtn 
                onClick={stand} 
                icon={<Hand className="w-5 h-5" />} 
                label="Stand" 
                color="bg-red-700 hover:bg-red-600"
              />
              {playerHand.length === 2 && (
                  <ControlBtn 
                    onClick={doubleDown} 
                    icon={<Coins className="w-5 h-5" />} 
                    label="Double" 
                    subLabel={`x2`}
                    color="bg-amber-600 hover:bg-amber-500"
                  />
              )}
           </div>
        )}

        {/* Game Over / Reset */}
        {gameState === 'gameOver' && (
            <div className="flex flex-col items-center gap-4">
                 <p className="text-slate-400 text-sm md:text-base mb-2">{resultMessage}</p>
                 <button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-slate-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                 >
                    <RotateCcw className="w-5 h-5" />
                    New Game
                 </button>
            </div>
        )}

      </footer>
    </div>
  );
};

const ControlBtn: React.FC<{onClick: () => void, icon: React.ReactNode, label: string, subLabel?: string, color: string}> = ({onClick, icon, label, subLabel, color}) => (
    <button 
        onClick={onClick}
        className={`
            flex flex-col items-center justify-center
            w-20 h-20 md:w-24 md:h-24 rounded-2xl
            ${color} text-white shadow-lg border-b-4 border-black/20
            active:translate-y-1 active:border-b-0 transition-all
        `}
    >
        {icon}
        <span className="mt-1 font-bold text-sm uppercase">{label}</span>
        {subLabel && <span className="text-[10px] opacity-80">{subLabel}</span>}
    </button>
)

export default App;