import React from 'react';
import { Candidate } from '../types';
import { Trophy, Star, Crown, PartyPopper } from 'lucide-react';

interface RoundWinnersDisplayProps {
  winners: Candidate[];
  roundName: string;
  roundColor: string;
  isGrandFinale?: boolean;
}

const CELEBRATION_MESSAGES = [
  "¡Increíble! 🎉",
  "¡Felicitaciones! 🏆",
  "¡Enhorabuena! ⭐",
  "¡Genial! 🌟",
  "¡Asombroso! ✨",
];

export const RoundWinnersDisplay: React.FC<RoundWinnersDisplayProps> = ({
  winners,
  roundName,
  roundColor,
  isGrandFinale = false,
}) => {
  if (winners.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in zoom-in duration-700">
      {/* Header de celebración */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          {isGrandFinale ? (
            <Crown size={32} className="text-yellow-500" />
          ) : (
            <PartyPopper size={28} className="text-yellow-500" />
          )}
          <h2 className={`text-3xl font-black bg-gradient-to-r ${roundColor} bg-clip-text text-transparent`}>
            {isGrandFinale ? '¡GRAN GANADOR!' : `¡${roundName} Completada!`}
          </h2>
          {isGrandFinale ? (
            <Crown size={32} className="text-yellow-500" />
          ) : (
            <PartyPopper size={28} className="text-yellow-500" />
          )}
        </div>
        <p className="text-gray-500">
          {isGrandFinale 
            ? 'El sorteo ha concluido con este gran ganador'
            : `${winners.length} ganador${winners.length > 1 ? 'es' : ''} seleccionado${winners.length > 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Grid de ganadores */}
      {isGrandFinale ? (
        // Diseño especial para el Gran Final
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 p-1 rounded-3xl shadow-2xl">
          <div className="bg-white rounded-3xl p-8">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute -inset-6 bg-yellow-400 rounded-full blur-2xl opacity-50 animate-pulse" />
                <img
                  src={winners[0].avatarUrl}
                  alt={winners[0].login}
                  className="w-40 h-40 rounded-full border-4 border-yellow-400 shadow-2xl relative z-10 object-cover"
                />
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 p-3 rounded-full z-20 shadow-lg">
                  <Crown size={32} strokeWidth={3} />
                </div>
              </div>
              <h3 className="mt-6 text-4xl font-black text-gray-900">
                {winners[0].login}
              </h3>
              <p className="mt-2 text-yellow-600 font-bold text-lg flex items-center gap-2">
                <Star size={20} className="fill-yellow-400" />
                GRAN GANADOR
                <Star size={20} className="fill-yellow-400" />
              </p>
              <a
                href={`https://github.com/${winners[0].login}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-semibold transition-colors"
              >
                Ver Perfil de GitHub
              </a>
            </div>
          </div>
        </div>
      ) : (
        // Grid para múltiples ganadores
        <div className={`grid gap-4 ${winners.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
          {winners.map((winner, idx) => (
            <div
              key={winner.id}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 flex flex-col items-center transform hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="relative">
                <img
                  src={winner.avatarUrl}
                  alt={winner.login}
                  className="w-16 h-16 rounded-full border-2 border-yellow-400 shadow-md object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-gray-900 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow">
                  {idx + 1}
                </div>
              </div>
              <h4 className="mt-3 font-bold text-gray-800 text-center truncate w-full">
                {winner.login}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {CELEBRATION_MESSAGES[idx % CELEBRATION_MESSAGES.length]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
