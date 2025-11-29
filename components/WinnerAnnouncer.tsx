import React from 'react';
import { Candidate } from '../types';
import { Trophy, Share2 } from 'lucide-react';

interface WinnerAnnouncerProps {
  winner: Candidate;
  roundName?: string;
}

const CELEBRATION_MESSAGES = [
  "¡Las estrellas se han alineado! ¡Eres nuestro campeón! 🌟",
  "¡La fortuna favorece a los valientes, y hoy te favorece a ti! 🎯",
  "De todos los participantes, ¡el destino te eligió a TI! 🏆",
  "¡Los dioses del sorteo han hablado! ¡La victoria es tuya! ⚡",
  "¡Venciste las probabilidades y reclamaste la corona! 👑",
  "¡Felicitaciones desde DevFest Pereira! 🎉",
  "¡El código ha decidido! ¡Eres el elegido! 💻",
];

export const WinnerAnnouncer: React.FC<WinnerAnnouncerProps> = ({ winner, roundName }) => {
  const message = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];

  return (
    <div className="mt-4 animate-in fade-in zoom-in duration-500 w-full max-w-md">
      <div className="bg-gradient-to-br from-blue-500 to-green-500 p-1 rounded-2xl shadow-2xl">
        <div className="bg-white rounded-xl p-6 flex flex-col items-center text-center">
          
          <div className="relative">
            <div className="absolute -inset-4 bg-yellow-400 rounded-full blur-xl opacity-40 animate-pulse"></div>
            <img 
              src={winner.avatarUrl} 
              alt={winner.login} 
              className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-xl relative z-10"
            />
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-gray-900 p-2 rounded-full z-20">
              <Trophy size={20} strokeWidth={3} />
            </div>
          </div>

          <h2 className="text-3xl font-black text-gray-900 mt-4 mb-1 tracking-tight">
            {winner.login}
          </h2>
          <p className="text-blue-600 font-mono text-xs uppercase tracking-widest mb-4">
            ¡Ganador {roundName ? `- ${roundName}` : ''}!
          </p>

          <div className="bg-gray-50 rounded-lg p-4 w-full border border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              "{message}"
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <a 
              href={`https://github.com/${winner.login}`} 
              target="_blank" 
              rel="noreferrer"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full font-semibold transition-colors flex items-center gap-2 border border-gray-300 text-sm"
            >
              Ver Perfil
            </a>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors flex items-center gap-2 text-sm">
              <Share2 size={16} />
              Compartir
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};