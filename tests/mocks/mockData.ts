/**
 * Mock data para tests y desarrollo
 * Úsalo para probar la aplicación sin necesidad de un Issue real de GitHub
 */

import { Candidate } from '../../types';

// Nombres de usuario ficticios pero realistas
const MOCK_USERNAMES = [
  'devfest_fan',
  'code_master',
  'flutter_dev',
  'angular_ninja',
  'react_lover',
  'kotlin_knight',
  'swift_samurai',
  'python_pro',
  'rust_enthusiast',
  'go_guru',
  'typescript_titan',
  'vue_virtuoso',
  'node_ninja',
  'docker_dude',
  'kubernetes_king',
  'cloud_champion',
  'ai_adventurer',
  'ml_maven',
  'data_scientist',
  'devops_dragon',
  'backend_boss',
  'frontend_fighter',
  'fullstack_falcon',
  'mobile_master',
  'web_wizard',
];

/**
 * Genera una lista de candidatos mock
 */
export function generateMockCandidates(count: number = 20): Candidate[] {
  const shuffled = [...MOCK_USERNAMES].sort(() => Math.random() - 0.5);
  const selectedNames = shuffled.slice(0, Math.min(count, MOCK_USERNAMES.length));
  
  // Si se piden más de los nombres disponibles, generar extras
  while (selectedNames.length < count) {
    selectedNames.push(`participant_${selectedNames.length + 1}`);
  }
  
  return selectedNames.map((login, i) => ({
    id: login,
    login,
    avatarUrl: `https://i.pravatar.cc/150?u=${login}`, // Avatar aleatorio
  }));
}

/**
 * Escenarios de prueba predefinidos
 */
export const TEST_SCENARIOS = {
  // Exactamente el mínimo requerido (11 participantes)
  minimum: () => generateMockCandidates(11),
  
  // Pocos participantes (menos del mínimo)
  tooFew: () => generateMockCandidates(8),
  
  // Cantidad típica
  typical: () => generateMockCandidates(25),
  
  // Muchos participantes
  large: () => generateMockCandidates(100),
  
  // Un solo participante
  single: () => generateMockCandidates(1),
  
  // Exactamente para una ronda (5)
  oneRound: () => generateMockCandidates(5),
};

/**
 * Simula comentarios de GitHub API
 */
export function generateMockGithubComments(userCount: number, commentsPerUser: number = 1) {
  const candidates = generateMockCandidates(userCount);
  const comments: Array<{ user: { login: string; avatar_url: string } }> = [];
  
  candidates.forEach(candidate => {
    for (let i = 0; i < commentsPerUser; i++) {
      comments.push({
        user: {
          login: candidate.login,
          avatar_url: candidate.avatarUrl,
        },
      });
    }
  });
  
  // Mezclar los comentarios para simular orden real
  return comments.sort(() => Math.random() - 0.5);
}

/**
 * Función helper para inyectar mock data en desarrollo
 * Úsala en la consola del navegador:
 * 
 * import('./tests/mocks/mockData').then(m => window.__mockCandidates = m.TEST_SCENARIOS.typical())
 */
export function injectMockData(scenario: keyof typeof TEST_SCENARIOS = 'typical') {
  const candidates = TEST_SCENARIOS[scenario]();
  console.log(`[MockData] Generados ${candidates.length} participantes:`, candidates.map(c => c.login));
  return candidates;
}
