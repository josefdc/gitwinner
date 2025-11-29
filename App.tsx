import React, { useState } from 'react';
import { Github, Play, RefreshCw, AlertCircle, SkipForward, Trophy, Users, Crown } from 'lucide-react';
import { AppState, Candidate } from './types';
import { fetchParticipants } from './services/githubService';
import { SlotMachine } from './components/SlotMachine';
import { WinnerAnnouncer } from './components/WinnerAnnouncer';
import { Confetti } from './components/Confetti';

// Configuración de rondas para DevFest Pereira
const ROUNDS_CONFIG = [
  { id: 1, name: 'Ronda 1', winners: 5, icon: Users, color: 'from-blue-500 to-cyan-500' },
  { id: 2, name: 'Ronda 2', winners: 5, icon: Trophy, color: 'from-green-500 to-emerald-500' },
  { id: 3, name: 'Gran Final', winners: 1, icon: Crown, color: 'from-yellow-500 to-orange-500' },
];

function App() {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [issueUrl, setIssueUrl] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [availableCandidates, setAvailableCandidates] = useState<Candidate[]>([]);
  const [winner, setWinner] = useState<Candidate | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Estado para múltiples rondas
  const [currentRound, setCurrentRound] = useState(0); // 0, 1, 2
  const [currentWinnerInRound, setCurrentWinnerInRound] = useState(0);
  const [allWinners, setAllWinners] = useState<{round: number, winners: Candidate[]}[]>([
    { round: 1, winners: [] },
    { round: 2, winners: [] },
    { round: 3, winners: [] },
  ]);

  const currentRoundConfig = ROUNDS_CONFIG[currentRound];
  const winnersInCurrentRound = allWinners[currentRound]?.winners || [];
  const remainingInRound = currentRoundConfig ? currentRoundConfig.winners - winnersInCurrentRound.length : 0;

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueUrl) return;

    setState(AppState.FETCHING);
    setErrorMsg('');
    setCandidates([]);
    setAvailableCandidates([]);
    setWinner(null);
    setCurrentRound(0);
    setCurrentWinnerInRound(0);
    setAllWinners([
      { round: 1, winners: [] },
      { round: 2, winners: [] },
      { round: 3, winners: [] },
    ]);

    try {
      const data = await fetchParticipants(issueUrl);
      setCandidates(data);
      setAvailableCandidates(data);
      setState(AppState.READY);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al cargar comentarios');
      setState(AppState.ERROR);
    }
  };

  const startRaffle = () => {
    if (availableCandidates.length === 0) return;
    
    setState(AppState.SPINNING);
    
    // Cryptographically secure random selection
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const randomIndex = array[0] % availableCandidates.length;
    
    setWinner(availableCandidates[randomIndex]);
  };

  const handleSpinEnd = () => {
    setState(AppState.WINNER);
    
    if (winner) {
      // Agregar ganador a la ronda actual
      setAllWinners(prev => {
        const updated = [...prev];
        updated[currentRound] = {
          ...updated[currentRound],
          winners: [...updated[currentRound].winners, winner]
        };
        return updated;
      });
      
      // Remover ganador de los disponibles
      setAvailableCandidates(prev => prev.filter(c => c.id !== winner.id));
      setCurrentWinnerInRound(prev => prev + 1);
    }
  };

  const continueRound = () => {
    // Continuar con el siguiente ganador en la misma ronda
    setWinner(null);
    setState(AppState.READY);
  };

  const nextRound = () => {
    if (currentRound < ROUNDS_CONFIG.length - 1) {
      setCurrentRound(prev => prev + 1);
      setCurrentWinnerInRound(0);
      setWinner(null);
      setState(AppState.READY);
    }
  };

  const reset = () => {
    setState(AppState.IDLE);
    setCandidates([]);
    setAvailableCandidates([]);
    setWinner(null);
    setIssueUrl('');
    setCurrentRound(0);
    setCurrentWinnerInRound(0);
    setAllWinners([
      { round: 1, winners: [] },
      { round: 2, winners: [] },
      { round: 3, winners: [] },
    ]);
  };

  const isRoundComplete = winnersInCurrentRound.length >= (currentRoundConfig?.winners || 0);
  const isAllComplete = currentRound === ROUNDS_CONFIG.length - 1 && isRoundComplete;
  const totalWinners = allWinners.reduce((acc, r) => acc + r.winners.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-gray-800 flex flex-col items-center py-8 px-4 relative">
      
      {state === AppState.WINNER && <Confetti />}

      <header className="mb-6 text-center max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Github size={36} className="text-gray-800" />
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">GitWinner</h1>
        </div>
        <p className="text-sm text-blue-600 font-mono">DevFest Pereira 2025 🎉</p>
      </header>

      <main className="w-full max-w-4xl z-10">
        
        {/* Input Stage */}
        <div className={`transition-all duration-500 ${state !== AppState.IDLE && state !== AppState.ERROR ? 'hidden' : 'block'}`}>
          <p className="text-gray-600 text-center mb-6">
            Convierte los comentarios de un Issue de GitHub en un emocionante sorteo.
          </p>
          <form onSubmit={handleFetch} className="relative group max-w-2xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex shadow-xl">
              <input
                type="text"
                placeholder="https://github.com/owner/repo/issues/123"
                className="w-full bg-white border border-gray-300 text-gray-800 px-6 py-4 rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm transition-all"
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
            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 max-w-2xl mx-auto">
              <AlertCircle size={20} />
              <p>{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Game Stage */}
        {(state === AppState.READY || state === AppState.SPINNING || state === AppState.WINNER) && (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Panel izquierdo - Rondas y Ganadores */}
            <div className="lg:w-72 space-y-4">
              {/* Indicador de Rondas */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Rondas</h3>
                <div className="space-y-2">
                  {ROUNDS_CONFIG.map((round, idx) => {
                    const RoundIcon = round.icon;
                    const isActive = idx === currentRound;
                    const isCompleted = idx < currentRound || (idx === currentRound && isRoundComplete);
                    const roundWinners = allWinners[idx]?.winners || [];
                    
                    return (
                      <div 
                        key={round.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          isActive ? `bg-gradient-to-r ${round.color} text-white shadow-md` : 
                          isCompleted ? 'bg-green-50 text-green-700 border border-green-200' : 
                          'bg-gray-50 text-gray-400'
                        }`}
                      >
                        <RoundIcon size={20} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{round.name}</p>
                          <p className="text-xs opacity-80">
                            {roundWinners.length}/{round.winners} ganador{round.winners > 1 ? 'es' : ''}
                          </p>
                        </div>
                        {isCompleted && <span className="text-green-500">✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lista de Ganadores */}
              {totalWinners > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
                  <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                    🏆 Ganadores ({totalWinners})
                  </h3>
                  <div className="space-y-3">
                    {allWinners.map((round, roundIdx) => (
                      round.winners.length > 0 && (
                        <div key={roundIdx}>
                          <p className="text-xs text-gray-400 font-mono mb-1">
                            {ROUNDS_CONFIG[roundIdx].name}
                          </p>
                          {round.winners.map((w, i) => (
                            <div key={w.id} className="flex items-center gap-2 py-1">
                              <img src={w.avatarUrl} alt={w.login} className="w-6 h-6 rounded-full" />
                              <span className="text-sm font-medium text-gray-700 truncate">{w.login}</span>
                            </div>
                          ))}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{availableCandidates.length}</p>
                    <p className="text-xs text-gray-500">Disponibles</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{totalWinners}</p>
                    <p className="text-xs text-gray-500">Ganadores</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel central - Slot Machine */}
            <div className="flex-1 flex flex-col items-center">
              
              {/* Header de ronda actual */}
              {currentRoundConfig && (
                <div className={`mb-4 px-6 py-2 rounded-full bg-gradient-to-r ${currentRoundConfig.color} text-white font-bold shadow-lg`}>
                  {currentRoundConfig.name} - {remainingInRound > 0 ? `Faltan ${remainingInRound}` : '¡Completada!'}
                </div>
              )}

              <SlotMachine 
                candidates={availableCandidates}
                winner={winner}
                isSpinning={state === AppState.SPINNING}
                onSpinEnd={handleSpinEnd}
              />

              {/* Controles */}
              <div className="mt-6 flex flex-col items-center gap-4">
                {state === AppState.READY && !isAllComplete && (
                  <button
                    onClick={startRaffle}
                    disabled={availableCandidates.length === 0}
                    className={`group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r ${currentRoundConfig?.color || 'from-blue-600 to-green-500'} rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ring-offset-slate-50 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50`}
                  >
                    <Play className="mr-2 fill-current" />
                    ¡SORTEAR GANADOR {winnersInCurrentRound.length + 1}!
                  </button>
                )}

                {state === AppState.SPINNING && (
                  <div className="text-gray-500 font-mono animate-pulse text-lg">
                    SORTEANDO...
                  </div>
                )}

                {state === AppState.WINNER && winner && (
                  <>
                    <WinnerAnnouncer winner={winner} roundName={currentRoundConfig?.name} />
                    
                    <div className="flex gap-3 mt-4">
                      {!isRoundComplete && (
                        <button
                          onClick={continueRound}
                          className={`px-6 py-3 bg-gradient-to-r ${currentRoundConfig?.color} text-white rounded-full font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2`}
                        >
                          <Play size={18} />
                          Siguiente Ganador ({remainingInRound - 1} más)
                        </button>
                      )}
                      
                      {isRoundComplete && !isAllComplete && (
                        <button
                          onClick={nextRound}
                          className={`px-6 py-3 bg-gradient-to-r ${ROUNDS_CONFIG[currentRound + 1]?.color} text-white rounded-full font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2`}
                        >
                          <SkipForward size={18} />
                          Ir a {ROUNDS_CONFIG[currentRound + 1]?.name}
                        </button>
                      )}

                      {isAllComplete && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600 mb-2">🎉 ¡Sorteo Completado!</p>
                          <p className="text-gray-500 mb-4">Todos los ganadores han sido seleccionados</p>
                          <button
                            onClick={reset}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition-all"
                          >
                            Nuevo Sorteo
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-8 text-center text-gray-500 text-sm">
        <p>Hecho con ❤️ para DevFest Pereira | React & Tailwind CSS</p>
      </footer>
    </div>
  );
}

export default App;