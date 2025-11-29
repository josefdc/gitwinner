import React from 'react';
import { Candidate } from '../types';
import { Trophy, Share2 } from 'lucide-react';

interface WinnerAnnouncerProps {
  winner: Candidate;
}

const CELEBRATION_MESSAGES = [
  "The stars have aligned! You're our champion! 🌟",
  "Fortune favors the bold, and today it favors you! 🎯",
  "Out of everyone, destiny chose YOU! 🏆",
  "The raffle gods have spoken! Victory is yours! ⚡",
  "You beat the odds and claimed the crown! 👑",
];

export const WinnerAnnouncer: React.FC<WinnerAnnouncerProps> = ({ winner }) => {
  const message = CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];

  return (
    <div className="mt-8 animate-in fade-in zoom-in duration-500">
      <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 p-1 rounded-2xl shadow-2xl border border-indigo-400/30">
        <div className="bg-gray-900/90 rounded-xl p-8 flex flex-col items-center text-center backdrop-blur-sm">
          
          <div className="relative">
            <div className="absolute -inset-4 bg-yellow-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <img 
              src={winner.avatarUrl} 
              alt={winner.login} 
              className="w-32 h-32 rounded-full border-4 border-yellow-400 shadow-xl relative z-10"
            />
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-gray-900 p-2 rounded-full z-20">
              <Trophy size={24} strokeWidth={3} />
            </div>
          </div>

          <h2 className="text-4xl font-black text-white mt-6 mb-2 tracking-tight">
            {winner.login}
          </h2>
          <p className="text-indigo-300 font-mono text-sm uppercase tracking-widest mb-6">Winner Selected</p>

          <div className="bg-gray-800/50 rounded-lg p-6 w-full max-w-lg border border-gray-700 relative overflow-hidden">
            <p className="text-lg text-gray-200 leading-relaxed font-medium">
              "{message}"
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <a 
              href={`https://github.com/${winner.login}`} 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold transition-colors flex items-center gap-2"
            >
              View Profile
            </a>
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-colors flex items-center gap-2">
              <Share2 size={18} />
              Share Result
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};