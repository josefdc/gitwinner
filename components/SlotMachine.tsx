import React, { useEffect, useState, useRef } from 'react';
import { Candidate } from '../types';

interface SlotMachineProps {
  candidates: Candidate[];
  winner: Candidate | null;
  isSpinning: boolean;
  onSpinEnd: () => void;
}

const SPIN_DURATION_MS = 3800;

export const SlotMachine: React.FC<SlotMachineProps> = ({ 
  candidates, 
  winner, 
  isSpinning, 
  onSpinEnd 
}) => {
  const [reelCandidates, setReelCandidates] = useState<Candidate[]>([]);
  const [winnerIndex, setWinnerIndex] = useState<number>(-1);
  const [highlightWinner, setHighlightWinner] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shakerRef = useRef<HTMLDivElement>(null);
  
  // Initialize the visual list
  useEffect(() => {
    if (candidates.length > 0 && !isSpinning && !winner) {
      const baseList = candidates.length < 10 
        ? [...candidates, ...candidates, ...candidates] 
        : candidates;
      setReelCandidates(baseList);
      setHighlightWinner(false);
      setWinnerIndex(-1);

      // Reset transforms
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.transition = 'none';
        scrollContainerRef.current.style.transform = 'translateY(0px)';
        scrollContainerRef.current.style.filter = 'blur(0px)';
      }
      if (shakerRef.current) {
        shakerRef.current.style.transform = 'translateY(0px)';
      }
    }
  }, [candidates, isSpinning, winner]);

  // Handle the Spin
  useEffect(() => {
    if (isSpinning && winner && scrollContainerRef.current) {
      setHighlightWinner(false);

      // 1. Build a massive list for the "infinite" scroll illusion
      const shuffle = (array: Candidate[]) => [...array].sort(() => Math.random() - 0.5);
      const fillerBatches = 25; // Good length for the duration
      const spinningList: Candidate[] = [];
      
      for (let i = 0; i < fillerBatches; i++) {
        spinningList.push(...shuffle(candidates));
      }
      
      // Ensure the winner is in the "Landing Zone"
      const landingBatch = shuffle(candidates).filter(c => c.id !== winner.id);
      
      // Insert winner in the middle of the landing batch
      const insertIdx = Math.floor(landingBatch.length / 2);
      landingBatch.splice(insertIdx, 0, winner);

      // Final constructed list for the animation
      const finalVisualList = [...reelCandidates, ...spinningList, ...landingBatch];
      setReelCandidates(finalVisualList);

      // Calculate where the winner is
      const winningRowIndex = finalVisualList.length - landingBatch.length + insertIdx;
      setWinnerIndex(winningRowIndex);

      // 2. Perform the Animation
      requestAnimationFrame(() => {
        // Double RAF to ensure state (list) is rendered to DOM
        requestAnimationFrame(() => {
          if (!scrollContainerRef.current) return;
          const container = scrollContainerRef.current;
          const itemHeight = container.firstElementChild?.clientHeight || 96;
          
          // Target: We want the winner to be the 2nd item in the viewport (centered)
          // Viewport shows ~3 items. Index 0 is top, Index 1 is center.
          // So we scroll to (winningRowIndex - 1)
          const targetScrollIndex = winningRowIndex - 1;
          const scrollTargetPx = targetScrollIndex * itemHeight;

          // Reset
          container.style.transition = 'none';
          container.style.transform = 'translateY(0px)';
          container.style.filter = 'blur(0px)';
          container.scrollTop = 0;

          // Force reflow
          void container.offsetHeight;

          // Main Spin Animation
          // ease-out-cubic modified for a heavy mechanical feel (fast start, strong brake)
          container.style.transition = `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.2, 0.6, 0.15, 1), filter ${SPIN_DURATION_MS * 0.6}ms ease-out`;
          container.style.transform = `translateY(-${scrollTargetPx}px)`;
          container.style.filter = 'blur(6px)';

          // Clear blur as we slow down
          setTimeout(() => {
            if (scrollContainerRef.current) {
               scrollContainerRef.current.style.filter = 'blur(0px)';
            }
          }, SPIN_DURATION_MS * 0.7);

          // Impact / Jiggle at the end
          setTimeout(() => {
            if (shakerRef.current) {
              // A custom keyframe-like shake using transition or animation
              // Simple vertical recoil
              shakerRef.current.animate([
                { transform: 'translateY(0px)' },
                { transform: 'translateY(8px)' },
                { transform: 'translateY(-4px)' },
                { transform: 'translateY(2px)' },
                { transform: 'translateY(0px)' }
              ], {
                duration: 400,
                easing: 'ease-out'
              });
            }
            
            setHighlightWinner(true);
            onSpinEnd();
          }, SPIN_DURATION_MS); 
        });
      });
    }
  }, [isSpinning, winner, candidates]);

  return (
    <div className="relative w-full max-w-md mx-auto transform transition-all duration-300">
      {/* Machine Frame */}
      <div className="bg-gray-800 border-4 border-gray-700 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
        
        {/* Glass Reflections & Overlays */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-30"></div>
        <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-gray-900 via-gray-900/90 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent z-20 pointer-events-none"></div>

        {/* Center Winner Zone Highlight */}
        <div className={`absolute top-1/2 -translate-y-1/2 w-full h-24 z-10 pointer-events-none transition-all duration-700 ${highlightWinner ? 'bg-yellow-500/10 border-y border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'bg-white/5 border-y border-gray-600/30'}`}></div>

        {/* Indicator Arrows */}
        <div className={`absolute top-1/2 -translate-y-1/2 left-2 z-30 text-3xl transition-all duration-500 ${highlightWinner ? 'text-yellow-400 scale-125 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]' : 'text-gray-600 opacity-50'}`}>▶</div>
        <div className={`absolute top-1/2 -translate-y-1/2 right-2 z-30 text-3xl transition-all duration-500 ${highlightWinner ? 'text-yellow-400 scale-125 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]' : 'text-gray-600 opacity-50'}`}>◀</div>

        {/* The Reel Window */}
        <div className="h-72 overflow-hidden relative bg-gray-900">
           {/* Shaker Container for the landing impact */}
           <div ref={shakerRef} className="w-full h-full">
             {/* The Moving Strip */}
             <div 
               ref={scrollContainerRef}
               className="w-full will-change-transform"
             >
                {reelCandidates.map((candidate, idx) => {
                  const isWinnerRow = highlightWinner && idx === winnerIndex;
                  
                  return (
                    <div 
                      key={`${candidate.id}-${idx}`} 
                      className={`h-24 flex items-center px-8 gap-4 border-b border-gray-800/50 transition-all duration-500 ${isWinnerRow ? 'bg-yellow-900/20' : ''}`}
                    >
                      <div className="relative">
                        <img 
                          src={candidate.avatarUrl} 
                          alt={candidate.login} 
                          className={`w-14 h-14 rounded-full border-2 bg-gray-800 object-cover transition-all duration-500 ease-out
                            ${isWinnerRow 
                              ? 'w-20 h-20 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.6)] scale-110 -translate-y-1' 
                              : 'border-gray-600 shadow-md'}`}
                        />
                        {isWinnerRow && (
                          <div className="absolute -inset-2 bg-yellow-400 rounded-full blur-md opacity-20 animate-pulse"></div>
                        )}
                      </div>
                      
                      <div className="flex flex-col overflow-hidden relative z-10">
                        <span className={`text-xl font-bold truncate font-mono transition-all duration-500 ${isWinnerRow ? 'text-yellow-400 text-2xl drop-shadow-md tracking-wide' : 'text-gray-100'}`}>
                          {candidate.login}
                        </span>
                        <span className={`text-xs uppercase tracking-widest transition-colors duration-300 ${isWinnerRow ? 'text-yellow-600 font-bold' : 'text-gray-500'}`}>
                          {isWinnerRow ? '¡GANADOR!' : 'Participante'}
                        </span>
                      </div>
                    </div>
                  );
                })}
             </div>
           </div>
        </div>
      </div>
      
      {/* Base of machine */}
      <div className="h-4 mx-8 bg-gray-800 rounded-b-xl shadow-xl border-x-2 border-b-2 border-gray-700 transform -translate-y-1 opacity-90"></div>
    </div>
  );
};
