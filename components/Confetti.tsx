import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'square';
}

const COLORS = ['#FFC700', '#FF0055', '#0099FF', '#22CC88', '#FFFFFF', '#FF6B35', '#7B2CBF'];

export const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Generate initial particles
    const count = prefersReducedMotion ? 30 : 150;
    const particles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: -20 - Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 10 + 5,
        speedX: (Math.random() - 0.5) * 8,
        speedY: Math.random() * 4 + 3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? 'circle' : 'square'
      });
    }
    particlesRef.current = particles;

    // Animation Loop using Canvas - no React re-renders!
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let activeParticles = 0;
      
      for (const p of particlesRef.current) {
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.speedY += 0.15; // Gravity
        p.speedX *= 0.99; // Air resistance
        
        // Skip if off screen
        if (p.y > canvas.height + 50) continue;
        activeParticles++;
        
        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, (canvas.height - p.y + 100) / 200);
        
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        
        ctx.restore();
      }
      
      // Continue animation if particles are still visible
      if (activeParticles > 0) {
        animationIdRef.current = requestAnimationFrame(animate);
      }
    };

    animationIdRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
};