import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

const COLORS = ['#FFC700', '#FF0055', '#0099FF', '#22CC88', '#FFFFFF'];

export const Confetti: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate initial particles
    const count = 150;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: 50, // Start center-ish (percent)
        y: -10, // Start above screen
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 2, // Spread
        speedY: Math.random() * 3 + 2, // Fall speed
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
    setParticles(newParticles);

    // Animation Loop
    let animationId: number;
    const animate = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.speedX * 0.5,
        y: p.y + p.speedY * 0.5,
        rotation: p.rotation + p.rotationSpeed,
        speedY: p.speedY + 0.05 // Gravity
      })).filter(p => p.y < 110)); // Remove if off screen

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px', // Mix of circles and squares
          }}
        />
      ))}
    </div>
  );
};