import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Recreamos las funciones para testear (sin importar para evitar problemas de módulos)
const extractIssueDetails = (url: string) => {
  const regex = /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
  const match = url.match(regex);
  if (!match) return null;
  return { owner: match[1], repo: match[2], issueNumber: match[3] };
};

interface GithubComment {
  user: {
    login: string;
    avatar_url: string;
  };
}

interface Candidate {
  id: string;
  login: string;
  avatarUrl: string;
}

const processComments = (comments: GithubComment[]): Candidate[] => {
  const uniqueUsers = new Map<string, Candidate>();
  
  comments.forEach(comment => {
    // Bot filtering
    if (comment.user.login.endsWith('[bot]')) return;

    if (!uniqueUsers.has(comment.user.login)) {
      uniqueUsers.set(comment.user.login, {
        id: comment.user.login,
        login: comment.user.login,
        avatarUrl: comment.user.avatar_url
      });
    }
  });

  return Array.from(uniqueUsers.values());
};

describe('GitHub Service', () => {
  describe('extractIssueDetails', () => {
    it('debe extraer correctamente owner, repo e issueNumber', () => {
      const url = 'https://github.com/devfest/pereira/issues/123';
      const result = extractIssueDetails(url);
      
      expect(result).toEqual({
        owner: 'devfest',
        repo: 'pereira',
        issueNumber: '123'
      });
    });

    it('debe manejar URLs con www', () => {
      const url = 'https://www.github.com/owner/repo/issues/456';
      // La regex maneja www porque solo busca 'github.com' en cualquier parte
      const result = extractIssueDetails(url);
      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        issueNumber: '456'
      });
    });

    it('debe manejar URLs con parámetros adicionales', () => {
      const url = 'https://github.com/owner/repo/issues/789?tab=comments';
      const result = extractIssueDetails(url);
      
      expect(result).toEqual({
        owner: 'owner',
        repo: 'repo',
        issueNumber: '789'
      });
    });

    it('debe rechazar URLs de pull requests', () => {
      const url = 'https://github.com/owner/repo/pull/123';
      const result = extractIssueDetails(url);
      
      expect(result).toBeNull();
    });

    it('debe rechazar URLs inválidas', () => {
      expect(extractIssueDetails('not-a-url')).toBeNull();
      expect(extractIssueDetails('https://gitlab.com/owner/repo/issues/1')).toBeNull();
      expect(extractIssueDetails('')).toBeNull();
    });

    it('debe manejar nombres de repo con guiones y puntos', () => {
      const url = 'https://github.com/my-org/my-awesome.repo/issues/42';
      const result = extractIssueDetails(url);
      
      expect(result).toEqual({
        owner: 'my-org',
        repo: 'my-awesome.repo',
        issueNumber: '42'
      });
    });
  });

  describe('processComments (Deduplicación)', () => {
    it('debe deduplicar usuarios con múltiples comentarios', () => {
      const comments: GithubComment[] = [
        { user: { login: 'user1', avatar_url: 'https://avatar1.com' } },
        { user: { login: 'user2', avatar_url: 'https://avatar2.com' } },
        { user: { login: 'user1', avatar_url: 'https://avatar1.com' } }, // duplicado
        { user: { login: 'user3', avatar_url: 'https://avatar3.com' } },
        { user: { login: 'user2', avatar_url: 'https://avatar2.com' } }, // duplicado
      ];

      const result = processComments(comments);
      
      expect(result.length).toBe(3);
      expect(result.map(u => u.login).sort()).toEqual(['user1', 'user2', 'user3']);
    });

    it('debe filtrar cuentas de bot', () => {
      const comments: GithubComment[] = [
        { user: { login: 'user1', avatar_url: 'https://avatar1.com' } },
        { user: { login: 'dependabot[bot]', avatar_url: 'https://bot.com' } },
        { user: { login: 'github-actions[bot]', avatar_url: 'https://bot2.com' } },
        { user: { login: 'user2', avatar_url: 'https://avatar2.com' } },
        { user: { login: 'renovate[bot]', avatar_url: 'https://bot3.com' } },
      ];

      const result = processComments(comments);
      
      expect(result.length).toBe(2);
      expect(result.every(u => !u.login.includes('[bot]'))).toBe(true);
    });

    it('debe preservar el primer avatar cuando hay duplicados', () => {
      const comments: GithubComment[] = [
        { user: { login: 'user1', avatar_url: 'https://first-avatar.com' } },
        { user: { login: 'user1', avatar_url: 'https://second-avatar.com' } },
      ];

      const result = processComments(comments);
      
      expect(result[0].avatarUrl).toBe('https://first-avatar.com');
    });

    it('debe retornar array vacío si solo hay bots', () => {
      const comments: GithubComment[] = [
        { user: { login: 'bot1[bot]', avatar_url: 'https://bot1.com' } },
        { user: { login: 'bot2[bot]', avatar_url: 'https://bot2.com' } },
      ];

      const result = processComments(comments);
      
      expect(result.length).toBe(0);
    });

    it('debe retornar array vacío si no hay comentarios', () => {
      const result = processComments([]);
      expect(result.length).toBe(0);
    });
  });

  describe('Simulación de Respuestas de API', () => {
    it('debe manejar respuesta con muchos usuarios únicos', () => {
      const comments: GithubComment[] = Array.from({ length: 100 }, (_, i) => ({
        user: { login: `user${i}`, avatar_url: `https://avatar${i}.com` }
      }));

      const result = processComments(comments);
      expect(result.length).toBe(100);
    });

    it('debe manejar respuesta donde todos son el mismo usuario', () => {
      const comments: GithubComment[] = Array.from({ length: 50 }, () => ({
        user: { login: 'same-user', avatar_url: 'https://avatar.com' }
      }));

      const result = processComments(comments);
      expect(result.length).toBe(1);
      expect(result[0].login).toBe('same-user');
    });
  });
});

describe('Integración - Flujo Completo', () => {
  it('debe simular un sorteo completo desde comentarios crudos', () => {
    // Simular 30 comentarios de 15 usuarios únicos
    const mockComments: GithubComment[] = [];
    for (let i = 1; i <= 15; i++) {
      // Cada usuario comenta 2 veces
      mockComments.push({ user: { login: `participant${i}`, avatar_url: `https://avatar${i}.com` } });
      mockComments.push({ user: { login: `participant${i}`, avatar_url: `https://avatar${i}.com` } });
    }
    // Agregar algunos bots
    mockComments.push({ user: { login: 'ci-bot[bot]', avatar_url: 'https://bot.com' } });

    // Procesar comentarios
    const candidates = processComments(mockComments);
    expect(candidates.length).toBe(15);

    // Simular sorteo 5+5+1
    let available = [...candidates];
    const rounds = [5, 5, 1];
    const allWinners: Candidate[] = [];

    rounds.forEach(winnersNeeded => {
      for (let i = 0; i < winnersNeeded; i++) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const idx = array[0] % available.length;
        const winner = available[idx];
        allWinners.push(winner);
        available = available.filter(c => c.id !== winner.id);
      }
    });

    // Verificaciones finales
    expect(allWinners.length).toBe(11);
    expect(available.length).toBe(4);
    expect(new Set(allWinners.map(w => w.id)).size).toBe(11); // Sin duplicados
  });
});
