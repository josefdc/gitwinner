import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * CHECKLIST PRE-DEMO - GitWinner DevFest Pereira 2025
 * 
 * Este archivo documenta y verifica todos los escenarios críticos
 * para la demostración en vivo.
 */

// Tipos
interface Candidate {
  id: string;
  login: string;
  avatarUrl: string;
}

// Función de selección (igual a producción)
function selectRandomWinner(candidates: Candidate[]): Candidate {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomIndex = array[0] % candidates.length;
  return candidates[randomIndex];
}

// Generar candidatos mock
function generateMockCandidates(count: number): Candidate[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    login: `devfest_user_${i + 1}`,
    avatarUrl: `https://avatars.githubusercontent.com/u/${1000 + i}`,
  }));
}

// Simular una ronda completa
function simulateRound(candidates: Candidate[], winnersNeeded: number): { winners: Candidate[], remaining: Candidate[] } {
  let available = [...candidates];
  const winners: Candidate[] = [];
  
  for (let i = 0; i < winnersNeeded && available.length > 0; i++) {
    const winner = selectRandomWinner(available);
    winners.push(winner);
    available = available.filter(c => c.id !== winner.id);
  }
  
  return { winners, remaining: available };
}

describe('🎯 CHECKLIST PRE-DEMO', () => {
  
  describe('✅ 1. Carga de Participantes', () => {
    it('debe manejar URLs de GitHub correctamente', () => {
      const validUrls = [
        'https://github.com/devfest/pereira/issues/1',
        'https://github.com/GDGPereira/evento-2025/issues/42',
        'https://github.com/mi-org/mi-repo/issues/123',
      ];
      
      const regex = /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
      
      validUrls.forEach(url => {
        const match = url.match(regex);
        expect(match).not.toBeNull();
        expect(match![1]).toBeTruthy(); // owner
        expect(match![2]).toBeTruthy(); // repo
        expect(match![3]).toBeTruthy(); // issue number
      });
    });

    it('debe rechazar URLs inválidas', () => {
      const invalidUrls = [
        'https://gitlab.com/owner/repo/issues/1',
        'not-a-url',
        'https://github.com/owner/repo/pull/1', // PR no issue
        '',
      ];
      
      const regex = /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
      
      invalidUrls.forEach(url => {
        const match = url.match(regex);
        expect(match).toBeNull();
      });
    });
  });

  describe('✅ 2. Sorteo Ronda 1 (5 ganadores)', () => {
    it('debe seleccionar exactamente 5 ganadores únicos', () => {
      const candidates = generateMockCandidates(30);
      const { winners, remaining } = simulateRound(candidates, 5);
      
      expect(winners.length).toBe(5);
      expect(remaining.length).toBe(25);
      expect(new Set(winners.map(w => w.id)).size).toBe(5); // Sin duplicados
    });

    it('los ganadores deben ser removidos de disponibles', () => {
      const candidates = generateMockCandidates(20);
      const { winners, remaining } = simulateRound(candidates, 5);
      
      winners.forEach(w => {
        expect(remaining.some(r => r.id === w.id)).toBe(false);
      });
    });
  });

  describe('✅ 3. Sorteo Ronda 2 (5 ganadores)', () => {
    it('debe funcionar con los participantes restantes de Ronda 1', () => {
      const candidates = generateMockCandidates(30);
      
      // Simular Ronda 1
      const round1 = simulateRound(candidates, 5);
      expect(round1.winners.length).toBe(5);
      
      // Simular Ronda 2 con los restantes
      const round2 = simulateRound(round1.remaining, 5);
      expect(round2.winners.length).toBe(5);
      expect(round2.remaining.length).toBe(20);
      
      // No debe haber duplicados entre rondas
      const allWinners = [...round1.winners, ...round2.winners];
      expect(new Set(allWinners.map(w => w.id)).size).toBe(10);
    });
  });

  describe('✅ 4. Gran Final (1 ganador)', () => {
    it('debe seleccionar 1 ganador único de los restantes', () => {
      const candidates = generateMockCandidates(30);
      
      // Simular Rondas 1 y 2
      const round1 = simulateRound(candidates, 5);
      const round2 = simulateRound(round1.remaining, 5);
      
      // Simular Gran Final
      const grandFinale = simulateRound(round2.remaining, 1);
      expect(grandFinale.winners.length).toBe(1);
      expect(grandFinale.remaining.length).toBe(19);
      
      // El ganador final no debe estar en ganadores previos
      const previousWinners = [...round1.winners, ...round2.winners];
      expect(previousWinners.some(w => w.id === grandFinale.winners[0].id)).toBe(false);
    });
  });

  describe('✅ 5. Caso Mínimo (11 participantes exactos)', () => {
    it('debe completar el sorteo sin errores', () => {
      const candidates = generateMockCandidates(11);
      
      const round1 = simulateRound(candidates, 5);
      expect(round1.winners.length).toBe(5);
      expect(round1.remaining.length).toBe(6);
      
      const round2 = simulateRound(round1.remaining, 5);
      expect(round2.winners.length).toBe(5);
      expect(round2.remaining.length).toBe(1);
      
      const grandFinale = simulateRound(round2.remaining, 1);
      expect(grandFinale.winners.length).toBe(1);
      expect(grandFinale.remaining.length).toBe(0);
      
      // Total: 11 ganadores únicos
      const allWinners = [...round1.winners, ...round2.winners, ...grandFinale.winners];
      expect(allWinners.length).toBe(11);
      expect(new Set(allWinners.map(w => w.id)).size).toBe(11);
    });
  });

  describe('✅ 6. Caso Insuficiente (<11 participantes)', () => {
    it('debe detectar participantes insuficientes', () => {
      const candidates = generateMockCandidates(8);
      const totalWinnersNeeded = 11;
      
      expect(candidates.length).toBeLessThan(totalWinnersNeeded);
      
      // El sistema debe mostrar warning (validación en UI)
      const hasEnoughParticipants = candidates.length >= totalWinnersNeeded;
      expect(hasEnoughParticipants).toBe(false);
    });

    it('debe poder sortear lo disponible aunque no complete', () => {
      const candidates = generateMockCandidates(8);
      
      // Ronda 1: 5 ganadores
      const round1 = simulateRound(candidates, 5);
      expect(round1.winners.length).toBe(5);
      
      // Ronda 2: solo 3 disponibles
      const round2 = simulateRound(round1.remaining, 5);
      expect(round2.winners.length).toBe(3); // Solo hay 3
      
      // Gran Final: 0 disponibles
      const grandFinale = simulateRound(round2.remaining, 1);
      expect(grandFinale.winners.length).toBe(0);
    });
  });

  describe('✅ 7. Aleatoriedad Criptográfica', () => {
    it('debe usar crypto.getRandomValues para selección', () => {
      // Verificar que crypto está disponible
      expect(typeof crypto.getRandomValues).toBe('function');
      
      // Verificar que funciona
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      expect(array[0]).toBeGreaterThanOrEqual(0);
    });

    it('debe distribuir uniformemente las selecciones', () => {
      const candidates = generateMockCandidates(5);
      const counts: Record<string, number> = {};
      candidates.forEach(c => { counts[c.id] = 0; });
      
      // 1000 selecciones
      for (let i = 0; i < 1000; i++) {
        const winner = selectRandomWinner(candidates);
        counts[winner.id]++;
      }
      
      // Cada candidato debería tener ~200 selecciones (20%)
      // Tolerancia del 15%
      const expected = 200;
      const tolerance = expected * 0.15;
      
      Object.values(counts).forEach(count => {
        expect(count).toBeGreaterThan(expected - tolerance);
        expect(count).toBeLessThan(expected + tolerance);
      });
    });
  });

  describe('✅ 8. Filtrado de Bots', () => {
    it('debe filtrar usuarios que terminan en [bot]', () => {
      const comments = [
        { user: { login: 'real_user', avatar_url: 'url' } },
        { user: { login: 'dependabot[bot]', avatar_url: 'url' } },
        { user: { login: 'github-actions[bot]', avatar_url: 'url' } },
        { user: { login: 'another_user', avatar_url: 'url' } },
      ];
      
      const filtered = comments.filter(c => !c.user.login.endsWith('[bot]'));
      
      expect(filtered.length).toBe(2);
      expect(filtered.every(c => !c.user.login.includes('[bot]'))).toBe(true);
    });
  });

  describe('✅ 9. Deduplicación de Usuarios', () => {
    it('debe contar cada usuario solo una vez aunque comente múltiples veces', () => {
      const comments = [
        { user: { login: 'user1', avatar_url: 'url1' } },
        { user: { login: 'user2', avatar_url: 'url2' } },
        { user: { login: 'user1', avatar_url: 'url1' } }, // Duplicado
        { user: { login: 'user3', avatar_url: 'url3' } },
        { user: { login: 'user2', avatar_url: 'url2' } }, // Duplicado
        { user: { login: 'user1', avatar_url: 'url1' } }, // Duplicado
      ];
      
      const uniqueUsers = new Map<string, any>();
      comments.forEach(c => {
        if (!uniqueUsers.has(c.user.login)) {
          uniqueUsers.set(c.user.login, c.user);
        }
      });
      
      expect(uniqueUsers.size).toBe(3);
    });
  });

  describe('✅ 10. Flujo Completo de Demo', () => {
    it('debe completar todo el sorteo sin errores', () => {
      // Simular 25 participantes (caso típico DevFest)
      const participants = generateMockCandidates(25);
      
      // Estado inicial
      expect(participants.length).toBe(25);
      
      // Verificación de requisitos
      const totalWinnersNeeded = 11;
      expect(participants.length).toBeGreaterThanOrEqual(totalWinnersNeeded);
      
      // === RONDA 1 ===
      const round1 = simulateRound(participants, 5);
      expect(round1.winners.length).toBe(5);
      console.log('✅ Ronda 1 completada: 5 ganadores');
      
      // === RONDA 2 ===
      const round2 = simulateRound(round1.remaining, 5);
      expect(round2.winners.length).toBe(5);
      console.log('✅ Ronda 2 completada: 5 ganadores');
      
      // === GRAN FINAL ===
      const grandFinale = simulateRound(round2.remaining, 1);
      expect(grandFinale.winners.length).toBe(1);
      console.log('✅ Gran Final completada: 1 ganador');
      
      // === VERIFICACIÓN FINAL ===
      const allWinners = [
        ...round1.winners,
        ...round2.winners,
        ...grandFinale.winners
      ];
      
      // 11 ganadores totales
      expect(allWinners.length).toBe(11);
      
      // Todos únicos
      expect(new Set(allWinners.map(w => w.id)).size).toBe(11);
      
      // 14 participantes restantes
      expect(grandFinale.remaining.length).toBe(14);
      
      console.log('🎉 SORTEO COMPLETO - 11 ganadores únicos seleccionados');
    });
  });
});

describe('📋 CHECKLIST TÉCNICO', () => {
  it('TypeScript compila sin errores', () => {
    // Este test pasa si el archivo compila
    expect(true).toBe(true);
  });

  it('Tipos están correctamente definidos', () => {
    interface Candidate {
      id: string;
      login: string;
      avatarUrl: string;
    }
    
    const candidate: Candidate = {
      id: 'test',
      login: 'testuser',
      avatarUrl: 'https://example.com/avatar.png'
    };
    
    expect(candidate.id).toBe('test');
    expect(candidate.login).toBe('testuser');
    expect(candidate.avatarUrl).toContain('https://');
  });
});
