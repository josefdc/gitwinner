import { describe, it, expect, beforeEach } from 'vitest';

// Tipos
interface Candidate {
  id: string;
  login: string;
  avatarUrl: string;
}

// Función de selección aleatoria criptográfica (copiada de App.tsx)
function selectRandomWinner(candidates: Candidate[]): Candidate {
  if (candidates.length === 0) {
    throw new Error('No hay candidatos disponibles');
  }
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomIndex = array[0] % candidates.length;
  return candidates[randomIndex];
}

// Función para remover ganador de la lista
function removeWinner(candidates: Candidate[], winner: Candidate): Candidate[] {
  return candidates.filter(c => c.id !== winner.id);
}

// Generar candidatos de prueba
function generateMockCandidates(count: number): Candidate[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    login: `testuser${i + 1}`,
    avatarUrl: `https://avatars.githubusercontent.com/u/${i + 1}`,
  }));
}

describe('Lógica del Sorteo', () => {
  let candidates: Candidate[];

  beforeEach(() => {
    candidates = generateMockCandidates(20);
  });

  describe('Selección de Ganador', () => {
    it('debe seleccionar un ganador de la lista de candidatos', () => {
      const winner = selectRandomWinner(candidates);
      
      expect(winner).toBeDefined();
      expect(candidates.some(c => c.id === winner.id)).toBe(true);
    });

    it('debe lanzar error si no hay candidatos', () => {
      expect(() => selectRandomWinner([])).toThrow('No hay candidatos disponibles');
    });

    it('debe poder seleccionar de una lista con un solo candidato', () => {
      const singleCandidate = [candidates[0]];
      const winner = selectRandomWinner(singleCandidate);
      
      expect(winner.id).toBe(singleCandidate[0].id);
    });

    it('debe distribuir la selección de manera uniforme (test estadístico)', () => {
      const smallList = generateMockCandidates(5);
      const selections: Record<string, number> = {};
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const winner = selectRandomWinner(smallList);
        selections[winner.id] = (selections[winner.id] || 0) + 1;
      }

      // Cada candidato debería ser seleccionado aproximadamente 200 veces (1000/5)
      // Permitimos una variación del 30%
      const expectedAvg = iterations / smallList.length;
      const tolerance = expectedAvg * 0.3;

      Object.values(selections).forEach(count => {
        expect(count).toBeGreaterThan(expectedAvg - tolerance);
        expect(count).toBeLessThan(expectedAvg + tolerance);
      });
    });
  });

  describe('Remoción de Ganadores', () => {
    it('debe remover correctamente un ganador de la lista', () => {
      const winner = candidates[5];
      const remaining = removeWinner(candidates, winner);
      
      expect(remaining.length).toBe(candidates.length - 1);
      expect(remaining.some(c => c.id === winner.id)).toBe(false);
    });

    it('no debe modificar la lista original', () => {
      const originalLength = candidates.length;
      const winner = candidates[0];
      removeWinner(candidates, winner);
      
      expect(candidates.length).toBe(originalLength);
    });

    it('debe manejar correctamente si el ganador no está en la lista', () => {
      const fakeWinner: Candidate = { id: 'fake-id', login: 'fake', avatarUrl: '' };
      const remaining = removeWinner(candidates, fakeWinner);
      
      expect(remaining.length).toBe(candidates.length);
    });
  });

  describe('Simulación de Sorteo Completo (5+5+1)', () => {
    const ROUNDS_CONFIG = [
      { id: 1, name: 'Ronda 1', winners: 5 },
      { id: 2, name: 'Ronda 2', winners: 5 },
      { id: 3, name: 'Gran Final', winners: 1 },
    ];

    it('debe completar todas las rondas sin duplicados', () => {
      let available = [...candidates];
      const allWinners: Candidate[] = [];

      ROUNDS_CONFIG.forEach(round => {
        for (let i = 0; i < round.winners; i++) {
          expect(available.length).toBeGreaterThan(0);
          
          const winner = selectRandomWinner(available);
          allWinners.push(winner);
          available = removeWinner(available, winner);
        }
      });

      // Verificar que tenemos 11 ganadores únicos
      expect(allWinners.length).toBe(11);
      
      // Verificar que no hay duplicados
      const uniqueIds = new Set(allWinners.map(w => w.id));
      expect(uniqueIds.size).toBe(11);
    });

    it('debe funcionar con exactamente 11 participantes (mínimo requerido)', () => {
      const minCandidates = generateMockCandidates(11);
      let available = [...minCandidates];
      const allWinners: Candidate[] = [];

      ROUNDS_CONFIG.forEach(round => {
        for (let i = 0; i < round.winners; i++) {
          const winner = selectRandomWinner(available);
          allWinners.push(winner);
          available = removeWinner(available, winner);
        }
      });

      expect(allWinners.length).toBe(11);
      expect(available.length).toBe(0);
    });

    it('debe dejar participantes restantes correctos', () => {
      const totalWinners = ROUNDS_CONFIG.reduce((acc, r) => acc + r.winners, 0);
      let available = [...candidates];
      
      ROUNDS_CONFIG.forEach(round => {
        for (let i = 0; i < round.winners; i++) {
          const winner = selectRandomWinner(available);
          available = removeWinner(available, winner);
        }
      });

      expect(available.length).toBe(candidates.length - totalWinners);
    });
  });

  describe('Edge Cases', () => {
    it('debe manejar candidatos con IDs similares', () => {
      const similar = [
        { id: 'user-1', login: 'user1', avatarUrl: '' },
        { id: 'user-10', login: 'user10', avatarUrl: '' },
        { id: 'user-100', login: 'user100', avatarUrl: '' },
      ];
      
      const winner = selectRandomWinner(similar);
      const remaining = removeWinner(similar, winner);
      
      expect(remaining.length).toBe(2);
      expect(remaining.every(c => c.id !== winner.id)).toBe(true);
    });

    it('debe manejar múltiples selecciones consecutivas correctamente', () => {
      let available = [...candidates];
      const selections: Candidate[] = [];

      // Seleccionar 15 ganadores consecutivos
      for (let i = 0; i < 15; i++) {
        const winner = selectRandomWinner(available);
        selections.push(winner);
        available = removeWinner(available, winner);
      }

      expect(selections.length).toBe(15);
      expect(available.length).toBe(5);
      
      // Verificar que todos son únicos
      const uniqueIds = new Set(selections.map(s => s.id));
      expect(uniqueIds.size).toBe(15);
    });
  });
});
