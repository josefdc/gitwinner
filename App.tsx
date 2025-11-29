import React, { useState } from 'react';
import { Github, Play, RefreshCw, AlertCircle } from 'lucide-react';
import { AppState, Candidate } from './types';
import { fetchParticipants } from './services/githubService';
import { SlotMachine } from './components/SlotMachine';
import { WinnerAnnouncer } from './components/WinnerAnnouncer';
import { Confetti } from './components/Confetti';

function App() {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [issueUrl, setIssueUrl] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [winner, setWinner] = useState<Candidate | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueUrl) return;

    setState(AppState.FETCHING);
    setErrorMsg('');
    setCandidates([]);
    setWinner(null);

    try {
      const data = await fetchParticipants(issueUrl);
      setCandidates(data);
      setState(AppState.READY);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to fetch comments');
      setState(AppState.ERROR);
    }
  };

  const startRaffle = () => {
    if (candidates.length === 0) return;
    
    setState(AppState.SPINNING);
    
    // Cryptographically secure random selection
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const randomIndex = array[0] % candidates.length;
    
    setWinner(candidates[randomIndex]);
  };

  const handleSpinEnd = () => {
    setState(AppState.WINNER);
  };

  const reset = () => {
    setState(AppState.IDLE);
    setCandidates([]);
    setWinner(null);
    setIssueUrl('');
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col items-center py-12 px-4 relative">
      
      {state === AppState.WINNER && <Confetti />}

      <header className="mb-12 text-center max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Github size={40} className="text-white" />
          <h1 className="text-4xl font-black text-white tracking-tighter">GitWinner</h1>
        </div>
        <p className="text-sm text-blue-400 font-mono mb-2">DevFest Pereira 2025 🎉</p>
        <p className="text-gray-400 text-lg">
          Convierte los comentarios de un Issue de GitHub en un emocionante sorteo.
          Pega la URL del issue abajo para comenzar.
        </p>
      </header>

      <main className="w-full max-w-2xl z-10">
        
        {/* Input Stage */}
        <div className={`transition-all duration-500 ${state !== AppState.IDLE && state !== AppState.ERROR ? 'opacity-50 pointer-events-none scale-95 mb-8 hidden' : 'block'}`}>
          <form onSubmit={handleFetch} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex shadow-2xl">
              <input
                type="text"
                placeholder="https://github.com/owner/repo/issues/123"
                className="w-full bg-[#161b22] border border-[#30363d] text-white px-6 py-4 rounded-l-lg focus:outline-none focus:border-blue-500 font-mono text-sm transition-colors"
                value={issueUrl}
                onChange={(e) => setIssueUrl(e.target.value)}
              />
              <button
                type="submit"
                disabled={state === AppState.FETCHING}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-r-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state === AppState.FETCHING ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <>Cargar <span className="hidden sm:inline">Participantes</span></>
                )}
              </button>
            </div>
          </form>
          {state === AppState.ERROR && (
            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-900/50">
              <AlertCircle size={20} />
              <p>{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Game Stage */}
        {(state === AppState.READY || state === AppState.SPINNING || state === AppState.WINNER) && (
          <div className="flex flex-col items-center">
            
            <div className="mb-6 flex items-center justify-between w-full max-w-md px-2">
              <span className="text-sm font-mono text-gray-500">
                {candidates.length} PARTICIPANTES
              </span>
              {state === AppState.WINNER && (
                 <button onClick={reset} className="text-xs text-blue-400 hover:text-blue-300 underline">Nuevo Sorteo</button>
              )}
            </div>

            <SlotMachine 
              candidates={candidates}
              winner={winner}
              isSpinning={state === AppState.SPINNING}
              onSpinEnd={handleSpinEnd}
            />

            {/* Controles */}
            {state === AppState.READY && (
              <button
                onClick={startRaffle}
                className="mt-8 group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-green-600 font-lg rounded-full hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 ring-offset-[#0d1117] transform active:scale-95 shadow-[0_0_20px_rgba(22,163,74,0.5)] hover:shadow-[0_0_30px_rgba(22,163,74,0.7)]"
              >
                <Play className="mr-2 fill-current" />
                ¡INICIAR SORTEO!
              </button>
            )}

            {state === AppState.SPINNING && (
              <div className="mt-8 text-gray-500 font-mono animate-pulse">
                SORTEANDO...
              </div>
            )}

            {state === AppState.WINNER && winner && (
              <WinnerAnnouncer winner={winner} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center text-gray-600 text-sm">
        <p>Hecho con ❤️ para DevFest Pereira | React & Tailwind CSS</p>
      </footer>
    </div>
  );
}

export default App;