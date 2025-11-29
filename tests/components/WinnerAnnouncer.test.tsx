import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { WinnerAnnouncer } from '../../components/WinnerAnnouncer';

const mockWinner = {
  id: 'testuser',
  login: 'testuser',
  avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
};

describe('WinnerAnnouncer Component', () => {
  it('debe renderizar el nombre del ganador', () => {
    render(<WinnerAnnouncer winner={mockWinner} />);
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('debe mostrar el nombre de la ronda si se proporciona', () => {
    render(<WinnerAnnouncer winner={mockWinner} roundName="Ronda 1" />);
    
    expect(screen.getByText(/Ronda 1/)).toBeInTheDocument();
  });

  it('debe mostrar "¡Ganador!" en el texto', () => {
    render(<WinnerAnnouncer winner={mockWinner} />);
    
    expect(screen.getByText(/¡Ganador/)).toBeInTheDocument();
  });

  it('debe tener un enlace al perfil de GitHub', () => {
    render(<WinnerAnnouncer winner={mockWinner} />);
    
    const link = screen.getByRole('link', { name: /Ver Perfil/i });
    expect(link).toHaveAttribute('href', 'https://github.com/testuser');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('debe mostrar el avatar del ganador', () => {
    render(<WinnerAnnouncer winner={mockWinner} />);
    
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', mockWinner.avatarUrl);
  });

  it('debe mostrar un mensaje de celebración', () => {
    render(<WinnerAnnouncer winner={mockWinner} />);
    
    // Verificar que hay mensajes de celebración (puede haber múltiples elementos con emojis)
    const messageContainers = screen.getAllByText(/[¡🎉🏆⚡👑🌟🎯💻]/);
    expect(messageContainers.length).toBeGreaterThan(0);
  });

  it('debe tener botón de compartir', () => {
    render(<WinnerAnnouncer winner={mockWinner} />);
    
    expect(screen.getByRole('button', { name: /Compartir/i })).toBeInTheDocument();
  });

  it('debe memoizar el mensaje de celebración', () => {
    const { rerender } = render(<WinnerAnnouncer winner={mockWinner} />);
    
    // Obtener el mensaje inicial
    const messageContainer = document.querySelector('.bg-gray-50.rounded-lg p');
    const initialMessage = messageContainer?.textContent;
    
    // Re-renderizar con el mismo winner
    rerender(<WinnerAnnouncer winner={mockWinner} />);
    
    // El mensaje debería ser el mismo (memoizado)
    expect(messageContainer?.textContent).toBe(initialMessage);
  });
});
