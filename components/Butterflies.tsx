
import React, { useEffect, useRef } from 'react';

interface ButterfliesProps {
  themeColor?: string;
}

export const Butterflies: React.FC<ButterfliesProps> = ({ themeColor = '#ec4899' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Butterfly[] = [];
    let animationId: number;
    
    // Config
    const butterflyCount = 20; // Fewer particles, higher quality
    
    // High DPI Canvas Setup for "4K Quality"
    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      // Scale context to match user coordinate system
      ctx.scale(dpr, dpr);
    };
    
    // Convert hex to HSLA for better color manipulation
    const hexToHsl = (hex: string) => {
        let r = 0, g = 0, b = 0;
        if (hex.length === 4) {
            r = parseInt("0x" + hex[1] + hex[1]);
            g = parseInt("0x" + hex[2] + hex[2]);
            b = parseInt("0x" + hex[3] + hex[3]);
        } else if (hex.length === 7) {
            r = parseInt("0x" + hex[1] + hex[2]);
            g = parseInt("0x" + hex[3] + hex[4]);
            b = parseInt("0x" + hex[5] + hex[6]);
        }
        r /= 255; g /= 255; b /= 255;
        const cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
        let h = 0, s = 0, l = 0;

        if (delta === 0) h = 0;
        else if (cmax === r) h = ((g - b) / delta) % 6;
        else if (cmax === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;
        l = (cmax + cmin) / 2;
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return { h, s, l };
    };

    class Butterfly {
      x: number;
      y: number;
      z: number; // Depth
      vx: number;
      vy: number;
      vz: number;
      size: number;
      baseColorHsl: { h: number, s: number, l: number };
      wingPhase: number;
      flapSpeed: number;
      angle: number; // Movement direction
      
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 500; // Z-depth range 0-500
        
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 1;
        this.vz = (Math.random() - 0.5) * 0.5;
        
        this.size = Math.random() * 15 + 10; // Base size
        
        const hsl = hexToHsl(themeColor);
        // Vary the hue slightly for realism
        this.baseColorHsl = {
            h: hsl.h + (Math.random() * 40 - 20),
            s: 70 + Math.random() * 30,
            l: 60 + Math.random() * 20
        };
        
        this.wingPhase = Math.random() * Math.PI * 2;
        this.flapSpeed = 0.15 + Math.random() * 0.1;
        this.angle = Math.atan2(this.vy, this.vx);
      }

      update() {
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        
        this.wingPhase += this.flapSpeed;
        
        // Gentle noise movement
        this.vx += (Math.random() - 0.5) * 0.1;
        this.vy += (Math.random() - 0.5) * 0.1;
        this.vz += (Math.random() - 0.5) * 0.05;
        
        // Damping and Limit
        const speed = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        const maxSpeed = 2;
        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }
        
        // Calculate heading for rotation
        const targetAngle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
        // Smooth rotation interpolation
        let deltaAngle = targetAngle - this.angle;
        if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
        if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
        this.angle += deltaAngle * 0.05;

        // Boundaries (Wrap around 3D space)
        const margin = 100;
        if (this.x < -margin) this.x = width + margin;
        if (this.x > width + margin) this.x = -margin;
        if (this.y < -margin) this.y = height + margin;
        if (this.y > height + margin) this.y = -margin;
        if (this.z < 0) { this.z = 0; this.vz *= -1; }
        if (this.z > 500) { this.z = 500; this.vz *= -1; }
      }

      draw() {
        // Perspective Projection
        // Objects further away (higher Z) are smaller
        const perspective = 800;
        const scale = perspective / (perspective + this.z);
        const alpha = Math.min(1, Math.max(0.2, scale)); // Fade out distant ones
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);
        
        // Rotate towards movement direction
        ctx.rotate(this.angle);
        
        // Simulate banking (roll) based on turn sharpness would be cool, 
        // but let's stick to flapping Z-axis rotation
        const flap = Math.sin(this.wingPhase);
        // The wing width changes to simulate 3D flapping
        const wingWidth = Math.abs(flap);
        
        // Draw Shadow (offset and blurred)
        ctx.save();
        ctx.scale(wingWidth, 1);
        ctx.translate(10, 10);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.filter = 'blur(4px)';
        this.drawWingShape();
        ctx.scale(-1, 1); // Mirror for other shadow
        this.drawWingShape();
        ctx.restore();
        
        // Draw Real Wings
        // Gradient for "4K" detail
        const { h, s, l } = this.baseColorHsl;
        
        // Right Wing
        ctx.save();
        ctx.scale(wingWidth, 1);
        this.drawDetailedWing(h, s, l, alpha);
        ctx.restore();
        
        // Left Wing
        ctx.save();
        ctx.scale(-wingWidth, 1);
        this.drawDetailedWing(h, s, l, alpha);
        ctx.restore();
        
        // Body
        ctx.fillStyle = `rgba(30, 10, 30, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size / 6, this.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Antennae
        ctx.beginPath();
        ctx.strokeStyle = `rgba(30, 10, 30, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.moveTo(0, -this.size / 2);
        ctx.quadraticCurveTo(this.size/2, -this.size, this.size, -this.size * 1.2);
        ctx.moveTo(0, -this.size / 2);
        ctx.quadraticCurveTo(-this.size/2, -this.size, -this.size, -this.size * 1.2);
        ctx.stroke();

        ctx.restore();
      }
      
      drawDetailedWing(h: number, s: number, l: number, alpha: number) {
        // Wing Gradient
        const gradient = ctx.createRadialGradient(-this.size/2, -this.size/2, 0, 0, 0, this.size * 1.5);
        gradient.addColorStop(0, `hsla(${h}, ${s}%, ${l + 20}%, ${alpha})`); // Center highlight
        gradient.addColorStop(0.5, `hsla(${h}, ${s}%, ${l}%, ${alpha})`);   // Main color
        gradient.addColorStop(1, `hsla(${h + 20}, ${s}%, ${l - 20}%, ${alpha})`); // Edge darkness

        ctx.fillStyle = gradient;
        ctx.strokeStyle = `rgba(255,255,255, ${alpha * 0.3})`;
        ctx.lineWidth = 0.5;
        
        this.drawWingShape();
        ctx.fill();
        ctx.stroke();
        
        // Add "sparkle" or pattern dots
        ctx.fillStyle = `rgba(255,255,255, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(-this.size * 0.8, -this.size * 0.8, this.size * 0.1, 0, Math.PI * 2);
        ctx.arc(-this.size * 0.5, this.size * 0.8, this.size * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }

      drawWingShape() {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        // Top Wing part
        ctx.bezierCurveTo(this.size, -this.size * 1.5, this.size * 2, -this.size * 0.5, 0, 0);
        // Bottom Wing part
        ctx.bezierCurveTo(this.size * 1.2, this.size * 0.5, this.size * 0.5, this.size * 1.8, 0, 0);
        ctx.closePath();
      }
    }

    const init = () => {
        setSize();
        particles = [];
        for (let i = 0; i < butterflyCount; i++) {
            particles.push(new Butterfly());
        }
    };
    
    init();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Z-Sort: Draw furthest items first
      particles.sort((a, b) => b.z - a.z);
      
      particles.forEach(p => {
          p.update();
          p.draw();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', init);
    };
  }, [themeColor]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-20"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
