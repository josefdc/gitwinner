import { describe, it, expect } from 'vitest';
import { TEST_SCENARIOS, generateMockCandidates, generateMockGithubComments } from './mocks/mockData';

// Configuración de rondas (igual que en App.tsx)
const ROUNDS_CONFIG = [
  { id: 1, name: 'Ronda 1', winners: 5 },
  { id: 2, name: 'Ronda 2', winners: 5 },
  { id: 3, name: 'Gran Final', winners: 1 },
];

const TOTAL_WINNERS_NEEDED = 11;

// Función de selección (igual que en App.tsx)
function selectRandomWinner<T extends { id: string }>(candidates: T[]): T {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomIndex = array[0] % candidates.length;
  return candidates[randomIndex];
}

// Simula un sorteo completo
function runFullRaffle(candidates: { id: string; login: string; avatarUrl: string }[]) {
  let available = [...candidates];
  const roundResults: { round: string; winners: typeof candidates }[] = [];
  
  for (const round of ROUNDS_CONFIG) {
    const roundWinners: typeof candidates = [];
    
    for (let i = 0; i < round.winners && available.length > 0; i++) {
      const winner = selectRandomWinner(available);
      roundWinners.push(winner);
      available = available.filter(c => c.id !== winner.id);
    }
    
    roundResults.push({ round: round.name, winners: roundWinners });
  }
  
  return {
    roundResults,
    totalWinners: roundResults.flatMap(r => r.winners),
    remaining: available,
  };
}

describe('Escenarios de Uso', () => {
  describe('Escenario: Mínimo requerido (11 participantes)', () => {
    it('debe completar exactamente con todos seleccionados', () => {
      const candidates = TEST_SCENARIOS.minimum();
      const result = runFullRaffle(candidates);
      
      expect(result.totalWinners.length).toBe(11);
      expect(result.remaining.length).toBe(0);
      expect(result.roundResults[0].winners.length).toBe(5); // Ronda 1
      expect(result.roundResults[1].winners.length).toBe(5); // Ronda 2
      expect(result.roundResults[2].winners.length).toBe(1); // Gran Final
    });
  });

  describe('Escenario: Participantes insuficientes (8)', () => {
    it('debe detectar que no hay suficientes participantes', () => {
      const candidates = TEST_SCENARIOS.tooFew();
      
      expect(candidates.length).toBeLessThan(TOTAL_WINNERS_NEEDED);
      expect(candidates.length).toBe(8);
    });

    it('debe sortear lo que se pueda pero no completar', () => {
      const candidates = TEST_SCENARIOS.tooFew();
      const result = runFullRaffle(candidates);
      
      // Solo puede haber 8 ganadores máximo
      expect(result.totalWinners.length).toBe(8);
      expect(result.remaining.length).toBe(0);
      
      // Ronda 1: 5 ganadores
      expect(result.roundResults[0].winners.length).toBe(5);
      // Ronda 2: solo 3 (los que quedan)
      expect(result.roundResults[1].winners.length).toBe(3);
      // Gran Final: 0 (no quedan)
      expect(result.roundResults[2].winners.length).toBe(0);
    });
  });

  describe('Escenario: Cantidad típica (25 participantes)', () => {
    it('debe completar el sorteo y dejar participantes restantes', () => {
      const candidates = TEST_SCENARIOS.typical();
      const result = runFullRaffle(candidates);
      
      expect(result.totalWinners.length).toBe(11);
      expect(result.remaining.length).toBe(14); // 25 - 11
      
      // Verificar que ningún restante es ganador
      const winnerIds = new Set(result.totalWinners.map(w => w.id));
      result.remaining.forEach(r => {
        expect(winnerIds.has(r.id)).toBe(false);
      });
    });
  });

  describe('Escenario: Gran cantidad (100 participantes)', () => {
    it('debe funcionar eficientemente con muchos participantes', () => {
      const candidates = TEST_SCENARIOS.large();
      const startTime = performance.now();
      const result = runFullRaffle(candidates);
      const endTime = performance.now();
      
      expect(result.totalWinners.length).toBe(11);
      expect(result.remaining.length).toBe(89);
      
      // Debe ser rápido (menos de 50ms)
      expect(endTime - startTime).toBeLessThan(50);
    });

    it('debe mantener unicidad incluso con muchos participantes', () => {
      const candidates = TEST_SCENARIOS.large();
      
      // Ejecutar el sorteo 10 veces
      for (let i = 0; i < 10; i++) {
        const result = runFullRaffle(candidates);
        const winnerIds = result.totalWinners.map(w => w.id);
        const uniqueIds = new Set(winnerIds);
        
        expect(uniqueIds.size).toBe(11);
      }
    });
  });

  describe('Escenario: Un solo participante', () => {
    it('debe seleccionar al único participante en Ronda 1', () => {
      const candidates = TEST_SCENARIOS.single();
      const result = runFullRaffle(candidates);
      
      expect(result.totalWinners.length).toBe(1);
      expect(result.roundResults[0].winners.length).toBe(1);
      expect(result.roundResults[1].winners.length).toBe(0);
      expect(result.roundResults[2].winners.length).toBe(0);
    });
  });
});

describe('Generación de Mock Data', () => {
  it('debe generar la cantidad solicitada de candidatos', () => {
    expect(generateMockCandidates(5).length).toBe(5);
    expect(generateMockCandidates(15).length).toBe(15);
    expect(generateMockCandidates(50).length).toBe(50);
  });

  it('debe generar candidatos con estructura correcta', () => {
    const candidates = generateMockCandidates(3);
    
    candidates.forEach(c => {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('login');
      expect(c).toHaveProperty('avatarUrl');
      expect(typeof c.id).toBe('string');
      expect(typeof c.login).toBe('string');
      expect(c.avatarUrl).toMatch(/^https?:\/\//);
    });
  });

  it('debe generar comentarios mock correctamente', () => {
    const comments = generateMockGithubComments(5, 3);
    
    expect(comments.length).toBe(15); // 5 usuarios * 3 comentarios
    comments.forEach(c => {
      expect(c).toHaveProperty('user');
      expect(c.user).toHaveProperty('login');
      expect(c.user).toHaveProperty('avatar_url');
    });
  });
});

describe('Distribución Estadística del Sorteo', () => {
  it('debe distribuir ganadores de manera uniforme (1000 iteraciones)', () => {
    const candidates = generateMockCandidates(11);
    const winCounts: Record<string, number> = {};
    
    // Inicializar contadores
    candidates.forEach(c => { winCounts[c.id] = 0; });
    
    // Ejecutar 1000 sorteos
    for (let i = 0; i < 1000; i++) {
      const result = runFullRaffle(candidates);
      result.totalWinners.forEach(w => {
        winCounts[w.id]++;
      });
    }
    
    // Con 11 participantes y 11 ganadores por sorteo, todos deberían ganar siempre
    // cada participante debería ganar exactamente 1000 veces
    Object.values(winCounts).forEach(count => {
      expect(count).toBe(1000);
    });
  });

  it('debe mostrar variación cuando hay más participantes que premios', () => {
    const candidates = generateMockCandidates(22); // El doble del mínimo
    const winCounts: Record<string, number> = {};
    
    // Inicializar contadores
    candidates.forEach(c => { winCounts[c.id] = 0; });
    
    // Ejecutar 1000 sorteos
    for (let i = 0; i < 1000; i++) {
      const result = runFullRaffle(candidates);
      result.totalWinners.forEach(w => {
        winCounts[w.id]++;
      });
    }
    
    // Promedio esperado: 1000 * 11 / 22 = 500 victorias por persona
    const avgWins = 500;
    const tolerance = avgWins * 0.15; // 15% de tolerancia
    
    Object.values(winCounts).forEach(count => {
      expect(count).toBeGreaterThan(avgWins - tolerance);
      expect(count).toBeLessThan(avgWins + tolerance);
    });
  });
});
