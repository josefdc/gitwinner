import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Candidate } from '../types';
import { Trophy, Star } from 'lucide-react';

interface MultiSlotMachineProps {
  candidates: Candidate[];
  winnersToSelect: number;
  isSpinning: boolean;
  onAllWinnersSelected: (winners: Candidate[]) => void;
  roundColor: string;
  roundName: string;
  isGrandFinale?: boolean;
}

// Tiempos de animación
const SPIN_DURATION_BASE = 2500; // Duración base del spin
const SPIN_DURATION_INCREMENT = 400; // Cada ganador tarda un poco más
const REVEAL_DELAY = 800; // Pausa entre revelaciones

export const MultiSlotMachine: React.FC<MultiSlotMachineProps> = ({
  candidates,
  winnersToSelect,
  isSpinning,
  onAllWinnersSelected,
  roundColor,
  roundName,
  isGrandFinale = false,
}) => {
  const [currentWinnerIndex, setCurrentWinnerIndex] = useState(-1);
  const [revealedWinners, setRevealedWinners] = useState<Candidate[]>([]);
  const [displayCandidate, setDisplayCandidate] = useState<Candidate | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [allRevealed, setAllRevealed] = useState(false);
  
  const availableCandidatesRef = useRef<Candidate[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seleccionar ganador criptográficamente seguro
  const selectWinner = useCallback((available: Candidate[]): Candidate => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const randomIndex = array[0] % available.length;
    return available[randomIndex];
  }, []);

  // Limpiar intervalos y timeouts
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Iniciar el sorteo cuando isSpinning cambia a true
  useEffect(() => {
    if (isSpinning && currentWinnerIndex === -1) {
      // Reset state
      setRevealedWinners([]);
      setAllRevealed(false);
      availableCandidatesRef.current = [...candidates];
      
      // Comenzar con el primer ganador
      setCurrentWinnerIndex(0);
    }
  }, [isSpinning, candidates, currentWinnerIndex]);

  // Animación para cada ganador
  useEffect(() => {
    if (currentWinnerIndex < 0 || currentWinnerIndex >= winnersToSelect) return;
    if (availableCandidatesRef.current.length === 0) return;

    setIsAnimating(true);
    
    // Seleccionar el ganador antes de la animación
    const winner = selectWinner(availableCandidatesRef.current);
    
    // Animación de "shuffle" visual
    let shuffleCount = 0;
    const shuffleSpeed = isGrandFinale ? 80 : 100; // Más rápido para el final
    const totalShuffles = isGrandFinale ? 40 : 25 + (currentWinnerIndex * 5);
    
    intervalRef.current = setInterval(() => {
      // Mostrar candidato aleatorio durante el shuffle
      const randomIdx = Math.floor(Math.random() * availableCandidatesRef.current.length);
      setDisplayCandidate(availableCandidatesRef.current[randomIdx]);
      
      shuffleCount++;
      
      // Ralentizar gradualmente al final
      if (shuffleCount > totalShuffles * 0.7) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        // Fase de desaceleración
        let slowCount = 0;
        const slowPhase = () => {
          if (slowCount < 5) {
            const randomIdx = Math.floor(Math.random() * availableCandidatesRef.current.length);
            setDisplayCandidate(availableCandidatesRef.current[randomIdx]);
            slowCount++;
            timeoutRef.current = setTimeout(slowPhase, 200 + (slowCount * 100));
          } else {
            // Revelar ganador
            setDisplayCandidate(winner);
            setIsAnimating(false);
            
            // Agregar a ganadores revelados
            setRevealedWinners(prev => [...prev, winner]);
            
            // Remover de disponibles
            availableCandidatesRef.current = availableCandidatesRef.current.filter(
              c => c.id !== winner.id
            );
            
            // Pausa dramática antes del siguiente
            timeoutRef.current = setTimeout(() => {
              if (currentWinnerIndex < winnersToSelect - 1) {
                setCurrentWinnerIndex(prev => prev + 1);
                setDisplayCandidate(null);
              } else {
                // Todos revelados
                setAllRevealed(true);
              }
            }, REVEAL_DELAY);
          }
        };
        slowPhase();
      }
    }, shuffleSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentWinnerIndex, winnersToSelect, selectWinner, isGrandFinale]);

  // Notificar cuando todos los ganadores estén revelados
  useEffect(() => {
    if (allRevealed && revealedWinners.length === winnersToSelect) {
      // Pequeña pausa antes de notificar
      const timeout = setTimeout(() => {
        onAllWinnersSelected(revealedWinners);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [allRevealed, revealedWinners, winnersToSelect, onAllWinnersSelected]);

  // Reset cuando no está spinning
  useEffect(() => {
    if (!isSpinning) {
      setCurrentWinnerIndex(-1);
      setDisplayCandidate(null);
      setIsAnimating(false);
    }
  }, [isSpinning]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header de ronda */}
      <div className={`text-center mb-6 ${isGrandFinale ? 'animate-pulse' : ''}`}>
        <h2 className={`text-2xl font-black bg-gradient-to-r ${roundColor} bg-clip-text text-transparent`}>
          {roundName}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {isSpinning 
            ? `Seleccionando ganador ${currentWinnerIndex + 1} de ${winnersToSelect}...`
            : `${winnersToSelect} ganador${winnersToSelect > 1 ? 'es' : ''} por sortear`
          }
        </p>
      </div>

      {/* Slot principal - Candidato actual */}
      <div className={`relative bg-white rounded-2xl shadow-2xl border-4 ${isGrandFinale ? 'border-yellow-400' : 'border-gray-200'} overflow-hidden`}>
        {/* Efecto de brillo para Gran Final */}
        {isGrandFinale && isSpinning && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-pulse" />
        )}
        
        {/* Display del candidato actual */}
        <div className={`p-8 flex flex-col items-center transition-all duration-300 ${isAnimating ? 'scale-95' : 'scale-100'}`}>
          {displayCandidate ? (
            <>
              <div className={`relative ${isAnimating ? 'animate-bounce' : ''}`}>
                {!isAnimating && (
                  <div className="absolute -inset-4 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse" />
                )}
                <img
                  src={displayCandidate.avatarUrl}
                  alt={displayCandidate.login}
                  className={`w-32 h-32 rounded-full border-4 ${
                    isAnimating 
                      ? 'border-gray-300 blur-[2px]' 
                      : 'border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.5)]'
                  } transition-all duration-300 object-cover relative z-10`}
                />
                {!isAnimating && (
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-gray-900 p-2 rounded-full z-20 shadow-lg">
                    <Trophy size={24} strokeWidth={3} />
                  </div>
                )}
              </div>
              <h3 className={`mt-4 text-3xl font-black transition-all duration-300 ${
                isAnimating ? 'text-gray-400 blur-[1px]' : 'text-gray-900'
              }`}>
                {displayCandidate.login}
              </h3>
              {!isAnimating && (
                <p className="text-yellow-600 font-bold mt-1 flex items-center gap-1">
                  <Star size={16} className="fill-yellow-400" />
                  ¡GANADOR #{revealedWinners.length}!
                  <Star size={16} className="fill-yellow-400" />
                </p>
              )}
            </>
          ) : (
            <div className="py-8 text-center">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${roundColor} mx-auto flex items-center justify-center`}>
                <Trophy size={48} className="text-white" />
              </div>
              <p className="mt-4 text-gray-500 font-medium">
                {isSpinning ? 'Preparando...' : 'Listo para sortear'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ganadores revelados de esta ronda */}
      {revealedWinners.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 text-center">
            Ganadores de {roundName} ({revealedWinners.length}/{winnersToSelect})
          </h4>
          <div className="flex flex-wrap justify-center gap-3">
            {revealedWinners.map((winner, idx) => (
              <div
                key={winner.id}
                className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-200 animate-in fade-in zoom-in duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <img
                  src={winner.avatarUrl}
                  alt={winner.login}
                  className="w-8 h-8 rounded-full border-2 border-yellow-400"
                />
                <span className="font-semibold text-gray-800">{winner.login}</span>
                <span className="text-yellow-500 text-xs font-bold">#{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicador de progreso */}
      {isSpinning && (
        <div className="mt-6">
          <div className="flex justify-center gap-2">
            {Array.from({ length: winnersToSelect }).map((_, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  idx < revealedWinners.length
                    ? 'bg-yellow-400 scale-110'
                    : idx === currentWinnerIndex
                    ? `bg-gradient-to-r ${roundColor} animate-pulse scale-125`
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
