
import React, { useEffect, useRef } from 'react';

export const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    setSize();

    // Configuration
    const particleCount = 100;
    const gravity = 0.5;
    const colors = ['#ec4899', '#f472b6', '#fbbf24', '#60a5fa', '#34d399', '#a78bfa'];
    
    interface Particle {
      x: number;
      y: number;
      r: number;
      d: number; // density
      color: string;
      tilt: number;
      tiltAngleIncremental: number;
      tiltAngle: number;
    }

    const particles: Particle[] = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        r: Math.random() * 6 + 2,
        d: Math.random() * particleCount,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
        tiltAngle: 0
      });
    }

    let animationId: number;
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      angle += 0.01;
      
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        
        // Move particles
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(angle + p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(angle);
        p.tilt = Math.sin(p.tiltAngle) * 15;

        // Draw
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + (p.r / 2), p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + (p.r / 2));
        ctx.stroke();

        // Respawn if out of bounds
        if (p.x > width + 20 || p.x < -20 || p.y > height) {
           if (i % 5 > 0 || i % 2 === 0) { // Respawn logic
              particles[i] = {
                  x: Math.random() * width,
                  y: -10,
                  r: p.r,
                  d: p.d,
                  color: p.color,
                  tilt: p.tilt,
                  tiltAngleIncremental: p.tiltAngleIncremental,
                  tiltAngle: p.tiltAngle
              };
           }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener('resize', setSize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', setSize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-20"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
