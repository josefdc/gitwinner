import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RoundWinnersDisplay } from '../../components/RoundWinnersDisplay';

const mockWinners = [
  { id: 'user1', login: 'ganador1', avatarUrl: 'https://avatar1.com' },
  { id: 'user2', login: 'ganador2', avatarUrl: 'https://avatar2.com' },
  { id: 'user3', login: 'ganador3', avatarUrl: 'https://avatar3.com' },
];

describe('RoundWinnersDisplay Component', () => {
  it('debe renderizar null si no hay ganadores', () => {
    const { container } = render(
      <RoundWinnersDisplay
        winners={[]}
        roundName="Ronda 1"
        roundColor="from-blue-500 to-cyan-500"
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('debe mostrar el nombre de la ronda completada', () => {
    render(
      <RoundWinnersDisplay
        winners={mockWinners}
        roundName="Ronda 1"
        roundColor="from-blue-500 to-cyan-500"
      />
    );
    
    expect(screen.getByText(/Ronda 1 Completada/)).toBeInTheDocument();
  });

  it('debe mostrar todos los ganadores', () => {
    render(
      <RoundWinnersDisplay
        winners={mockWinners}
        roundName="Ronda 1"
        roundColor="from-blue-500 to-cyan-500"
      />
    );
    
    expect(screen.getByText('ganador1')).toBeInTheDocument();
    expect(screen.getByText('ganador2')).toBeInTheDocument();
    expect(screen.getByText('ganador3')).toBeInTheDocument();
  });

  it('debe mostrar el número de ganadores seleccionados', () => {
    render(
      <RoundWinnersDisplay
        winners={mockWinners}
        roundName="Ronda 2"
        roundColor="from-green-500 to-emerald-500"
      />
    );
    
    expect(screen.getByText(/3 ganadores seleccionados/)).toBeInTheDocument();
  });

  it('debe mostrar diseño especial para Gran Final', () => {
    const grandWinner = [{ id: 'champion', login: 'champion', avatarUrl: 'https://champ.com' }];
    
    render(
      <RoundWinnersDisplay
        winners={grandWinner}
        roundName="Gran Final"
        roundColor="from-yellow-500 to-orange-500"
        isGrandFinale={true}
      />
    );
    
    // Usar getAllByText porque hay múltiples elementos con GRAN GANADOR
    const granGanadorElements = screen.getAllByText(/GRAN GANADOR/);
    expect(granGanadorElements.length).toBeGreaterThan(0);
    expect(screen.getByText('champion')).toBeInTheDocument();
  });

  it('debe mostrar enlace a GitHub para el gran ganador', () => {
    const grandWinner = [{ id: 'winner', login: 'thewinner', avatarUrl: 'https://winner.com' }];
    
    render(
      <RoundWinnersDisplay
        winners={grandWinner}
        roundName="Gran Final"
        roundColor="from-yellow-500 to-orange-500"
        isGrandFinale={true}
      />
    );
    
    const githubLink = screen.getByRole('link', { name: /Ver Perfil de GitHub/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/thewinner');
    expect(githubLink).toHaveAttribute('target', '_blank');
  });

  it('debe mostrar avatares de todos los ganadores', () => {
    render(
      <RoundWinnersDisplay
        winners={mockWinners}
        roundName="Ronda 1"
        roundColor="from-blue-500 to-cyan-500"
      />
    );
    
    const avatars = screen.getAllByRole('img');
    expect(avatars.length).toBe(mockWinners.length);
  });

  it('debe mostrar números de posición para cada ganador', () => {
    render(
      <RoundWinnersDisplay
        winners={mockWinners}
        roundName="Ronda 1"
        roundColor="from-blue-500 to-cyan-500"
      />
    );
    
    // Los números de posición (#1, #2, #3) están en divs pequeños
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
