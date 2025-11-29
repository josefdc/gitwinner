import React, { useState, useCallback } from 'react';
import { Github, Play, RefreshCw, AlertCircle, SkipForward, Trophy, Users, Crown, UserCheck, RotateCcw, Sparkles } from 'lucide-react';
import { AppState, Candidate } from './types';
import { fetchParticipants } from './services/githubService';
import { MultiSlotMachine } from './components/MultiSlotMachine';
import { RoundWinnersDisplay } from './components/RoundWinnersDisplay';
import { Confetti } from './components/Confetti';

// Configuración de rondas para DevFest Pereira
const ROUNDS_CONFIG = [
  { id: 1, name: 'Ronda 1', winners: 5, icon: Users, color: 'from-blue-500 to-cyan-500' },
  { id: 2, name: 'Ronda 2', winners: 5, icon: Trophy, color: 'from-green-500 to-emerald-500' },
  { id: 3, name: 'Gran Final', winners: 1, icon: Crown, color: 'from-yellow-500 to-orange-500' },
];

// Estados del sorteo por ronda
type RoundState = 'pending' | 'spinning' | 'completed';

function App() {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [issueUrl, setIssueUrl] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [availableCandidates, setAvailableCandidates] = useState<Candidate[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Estado para rondas completas
  const [currentRound, setCurrentRound] = useState(0);
  const [roundState, setRoundState] = useState<RoundState>('pending');
  const [allWinners, setAllWinners] = useState<{round: number, winners: Candidate[]}[]>([
    { round: 1, winners: [] },
    { round: 2, winners: [] },
    { round: 3, winners: [] },
  ]);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentRoundConfig = ROUNDS_CONFIG[currentRound];
  const totalWinnersNeeded = ROUNDS_CONFIG.reduce((acc, r) => acc + r.winners, 0);
  const totalWinners = allWinners.reduce((acc, r) => acc + r.winners.length, 0);
  const hasEnoughParticipants = candidates.length >= totalWinnersNeeded;
  const isAllComplete = currentRound === ROUNDS_CONFIG.length - 1 && roundState === 'completed';

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!issueUrl) return;

    setState(AppState.FETCHING);
    setErrorMsg('');

    try {
      const data = await fetchParticipants(issueUrl);
      setCandidates(data);
      setAvailableCandidates(data);
      setLastFetchTime(new Date());
      setState(AppState.LOADED);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al cargar comentarios');
      setState(AppState.ERROR);
    }
  };

  const handleRefresh = async () => {
    if (!issueUrl || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const data = await fetchParticipants(issueUrl);
      const winnersIds = allWinners.flatMap(r => r.winners.map(w => w.id));
      const newAvailable = data.filter(c => !winnersIds.includes(c.id));
      
      setCandidates(data);
      setAvailableCandidates(newAvailable);
      setLastFetchTime(new Date());
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al actualizar');
    }
    setIsRefreshing(false);
  };

  const startRaffleSession = () => {
    setCurrentRound(0);
    setRoundState('pending');
    setAllWinners([
      { round: 1, winners: [] },
      { round: 2, winners: [] },
      { round: 3, winners: [] },
    ]);
    setShowConfetti(false);
    setState(AppState.READY);
  };

  const startRound = () => {
    if (availableCandidates.length < currentRoundConfig.winners) return;
    setRoundState('spinning');
    setShowConfetti(false);
  };

  const handleRoundComplete = useCallback((winners: Candidate[]) => {
    // Actualizar ganadores
    setAllWinners(prev => {
      const updated = [...prev];
      updated[currentRound] = {
        ...updated[currentRound],
        winners: winners
      };
      return updated;
    });
    
    // Remover ganadores de disponibles
    setAvailableCandidates(prev => 
      prev.filter(c => !winners.some(w => w.id === c.id))
    );
    
    setRoundState('completed');
    setShowConfetti(true);
  }, [currentRound]);

  const nextRound = () => {
    if (currentRound < ROUNDS_CONFIG.length - 1) {
      setCurrentRound(prev => prev + 1);
      setRoundState('pending');
      setShowConfetti(false);
    }
  };

  const reset = () => {
    setState(AppState.IDLE);
    setCandidates([]);
    setAvailableCandidates([]);
    setIssueUrl('');
    setCurrentRound(0);
    setRoundState('pending');
    setLastFetchTime(null);
    setShowConfetti(false);
    setAllWinners([
      { round: 1, winners: [] },
      { round: 2, winners: [] },
      { round: 3, winners: [] },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-gray-800 flex flex-col items-center py-8 px-4 relative">
      
      {showConfetti && <Confetti />}

      <header className="mb-6 text-center max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Github size={36} className="text-gray-800" aria-hidden="true" />
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">GitWinner</h1>
        </div>
        <p className="text-sm text-blue-600 font-mono">DevFest Pereira 2025 🎉</p>
      </header>

      <main id="main-content" className="w-full max-w-4xl z-10" role="main" aria-label="Área principal del sorteo">
        
        {/* Input Stage */}
        <div className={`transition-all duration-500 ${state !== AppState.IDLE && state !== AppState.ERROR ? 'hidden' : 'block'}`}>
          <p className="text-gray-600 text-center mb-6">
            Convierte los comentarios de un Issue de GitHub en un emocionante sorteo.
          </p>
          <form onSubmit={handleFetch} className="relative group max-w-2xl mx-auto" role="search">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex shadow-xl">
              <label htmlFor="issue-url" className="sr-only">URL del Issue de GitHub</label>
              <input
                id="issue-url"
                type="text"
                placeholder="https://github.com/owner/repo/issues/123"
                className="w-full bg-white border border-gray-300 text-gray-800 px-6 py-4 rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 font-mono text-sm transition-all"
                value={issueUrl}
                onChange={(e) => setIssueUrl(e.target.value)}
                aria-describedby="url-hint"
              />
              <button
                type="submit"
                disabled={state === AppState.FETCHING}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-r-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={state === AppState.FETCHING ? 'Cargando participantes...' : 'Cargar participantes'}
              >
                {state === AppState.FETCHING ? (
                  <RefreshCw className="animate-spin" aria-hidden="true" />
                ) : (
                  <>Cargar <span className="hidden sm:inline">Participantes</span></>
                )}
              </button>
            </div>
            <p id="url-hint" className="sr-only">Ingresa la URL completa del issue de GitHub</p>
          </form>
          {state === AppState.ERROR && (
            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 max-w-2xl mx-auto" role="alert" aria-live="polite">
              <AlertCircle size={20} aria-hidden="true" />
              <p>{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Loaded Stage - Vista previa de participantes */}
        {state === AppState.LOADED && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Participantes Cargados</h2>
                  <p className="text-gray-500 text-sm">
                    Última actualización: {lastFetchTime?.toLocaleTimeString('es-CO')}
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all disabled:opacity-50"
                  aria-label={isRefreshing ? 'Actualizando participantes...' : 'Actualizar lista de participantes'}
                >
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} aria-hidden="true" />
                  Actualizar
                </button>
              </div>
              
              {/* Stats grandes */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                  <p className="text-4xl font-black text-blue-600">{candidates.length}</p>
                  <p className="text-sm text-blue-700 font-medium">Participantes Únicos</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                  <p className="text-4xl font-black text-green-600">{totalWinnersNeeded}</p>
                  <p className="text-sm text-green-700 font-medium">Premios a Sortear</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                  <p className="text-4xl font-black text-purple-600">{ROUNDS_CONFIG.length}</p>
                  <p className="text-sm text-purple-700 font-medium">Rondas</p>
                </div>
              </div>

              {/* Info de rondas */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-700 mb-3">📋 Plan del Sorteo:</h3>
                <div className="grid grid-cols-3 gap-3">
                  {ROUNDS_CONFIG.map((round) => {
                    const RoundIcon = round.icon;
                    return (
                      <div key={round.id} className="flex items-center gap-2 text-sm">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${round.color} text-white`}>
                          <RoundIcon size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">{round.name}</p>
                          <p className="text-gray-500 text-xs">{round.winners} ganador{round.winners > 1 ? 'es' : ''}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {!hasEnoughParticipants && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3" role="alert">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-yellow-800">Participantes insuficientes</p>
                    <p className="text-yellow-700 text-sm">
                      Se necesitan al menos {totalWinnersNeeded} participantes para completar el sorteo. 
                      Actualmente hay {candidates.length}.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-semibold transition-all flex items-center gap-2"
                  aria-label="Cambiar Issue de GitHub"
                >
                  <RotateCcw size={18} aria-hidden="true" />
                  Cambiar Issue
                </button>
                <button
                  onClick={startRaffleSession}
                  disabled={candidates.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  aria-label={`Comenzar sorteo con ${candidates.length} participantes`}
                >
                  <Play size={18} className="fill-current" aria-hidden="true" />
                  ¡Comenzar Sorteo!
                </button>
              </div>
            </div>

            {/* Lista de participantes */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <UserCheck size={20} aria-hidden="true" />
                Lista de Participantes ({candidates.length})
              </h3>
              <div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto"
                role="list"
                aria-label="Lista de participantes del sorteo"
              >
                {candidates.map((candidate) => (
                  <div 
                    key={candidate.id}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    role="listitem"
                  >
                    <img 
                      src={candidate.avatarUrl} 
                      alt="" 
                      className="w-8 h-8 rounded-full border border-gray-200"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-gray-700 truncate">{candidate.login}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Stage */}
        {state === AppState.READY && (
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
                    const isCompleted = idx < currentRound || (idx === currentRound && roundState === 'completed');
                    const roundWinners = allWinners[idx]?.winners || [];
                    
                    return (
                      <div 
                        key={round.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          isActive && roundState !== 'completed'
                            ? `bg-gradient-to-r ${round.color} text-white shadow-md` 
                            : isCompleted 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-gray-50 text-gray-400'
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

              {/* Lista de Ganadores de rondas anteriores */}
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
                          {round.winners.map((w) => (
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

              {/* Actualizar participantes */}
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || roundState === 'spinning'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all disabled:opacity-50"
                  aria-label={isRefreshing ? 'Actualizando participantes...' : 'Actualizar lista de participantes'}
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} aria-hidden="true" />
                  <span className="text-sm font-medium">Actualizar</span>
                </button>
                {lastFetchTime && (
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Última: {lastFetchTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>

            {/* Panel central */}
            <div className="flex-1 flex flex-col items-center">
              
              {/* Estado: Pendiente - Mostrar botón para iniciar ronda */}
              {roundState === 'pending' && (
                <div className="text-center py-8">
                  <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r ${currentRoundConfig.color} text-white font-bold mb-6`}>
                    {React.createElement(currentRoundConfig.icon, { size: 24 })}
                    <span className="text-xl">{currentRoundConfig.name}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    {currentRoundConfig.id === 3 
                      ? '¡Es hora del gran final! Un ganador será elegido.'
                      : `Se sortearán ${currentRoundConfig.winners} ganadores en esta ronda.`
                    }
                  </p>
                  
                  <button
                    onClick={startRound}
                    disabled={availableCandidates.length < currentRoundConfig.winners}
                    className={`group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white text-xl transition-all duration-200 bg-gradient-to-r ${currentRoundConfig.color} rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ring-offset-slate-50 transform active:scale-95 hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:hover:scale-100`}
                    aria-label={`Iniciar ${currentRoundConfig.name}`}
                  >
                    <Sparkles className="mr-3" size={28} aria-hidden="true" />
                    ¡INICIAR {currentRoundConfig.name.toUpperCase()}!
                  </button>
                  
                  {availableCandidates.length < currentRoundConfig.winners && (
                    <p className="mt-4 text-red-500 text-sm">
                      No hay suficientes participantes ({availableCandidates.length}/{currentRoundConfig.winners} necesarios)
                    </p>
                  )}
                </div>
              )}

              {/* Estado: Spinning - Mostrar MultiSlotMachine */}
              {roundState === 'spinning' && (
                <MultiSlotMachine
                  candidates={availableCandidates}
                  winnersToSelect={currentRoundConfig.winners}
                  isSpinning={true}
                  onAllWinnersSelected={handleRoundComplete}
                  roundColor={currentRoundConfig.color}
                  roundName={currentRoundConfig.name}
                  isGrandFinale={currentRoundConfig.id === 3}
                />
              )}

              {/* Estado: Completado - Mostrar ganadores de la ronda */}
              {roundState === 'completed' && (
                <div className="w-full">
                  <RoundWinnersDisplay
                    winners={allWinners[currentRound]?.winners || []}
                    roundName={currentRoundConfig.name}
                    roundColor={currentRoundConfig.color}
                    isGrandFinale={currentRoundConfig.id === 3}
                  />
                  
                  <div className="mt-8 flex justify-center gap-4">
                    {!isAllComplete ? (
                      <button
                        onClick={nextRound}
                        className={`px-8 py-4 bg-gradient-to-r ${ROUNDS_CONFIG[currentRound + 1]?.color} text-white rounded-full font-bold shadow-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-lg`}
                        aria-label={`Continuar a ${ROUNDS_CONFIG[currentRound + 1]?.name}`}
                      >
                        <SkipForward size={24} aria-hidden="true" />
                        Continuar a {ROUNDS_CONFIG[currentRound + 1]?.name}
                      </button>
                    ) : (
                      <div className="text-center" role="status" aria-live="polite">
                        <p className="text-3xl font-black text-green-600 mb-2">🎉 ¡Sorteo Completado!</p>
                        <p className="text-gray-500 mb-6">Todos los {totalWinners} ganadores han sido seleccionados</p>
                        <button
                          onClick={reset}
                          className="px-8 py-4 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 hover:scale-105 active:scale-95 transition-all text-lg"
                          aria-label="Iniciar un nuevo sorteo"
                        >
                          Nuevo Sorteo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
