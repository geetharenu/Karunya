
import React, { useMemo } from 'react';

interface BokehProps {
  themeColor?: string;
}

export const Bokeh: React.FC<BokehProps> = ({ themeColor = '#ec4899' }) => {
  // Generate random orbs only once
  const orbs = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => {
      // 50% chance to use the custom theme color, otherwise use galaxy presets
      const useThemeColor = Math.random() > 0.5;
      
      const galaxyColors = [
        '#a855f7', // purple-500
        '#ec4899', // pink-500
        '#6366f1', // indigo-500
        '#3b82f6', // blue-500
        '#eab308', // yellow-500
        '#c026d3'  // fuchsia-600
      ];
      
      const finalColor = useThemeColor ? themeColor : galaxyColors[Math.floor(Math.random() * galaxyColors.length)];

      return {
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${Math.random() * 300 + 100}px`, // 100px to 400px
        animationDuration: `${Math.random() * 15 + 10}s`, // 10s to 25s
        animationDelay: `${Math.random() * -20}s`, // negative delay to start at random positions
        opacity: Math.random() * 0.15 + 0.05, // very subtle
        color: finalColor
      };
    });
  }, [themeColor]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`absolute rounded-full blur-[80px] mix-blend-screen animate-float`}
          style={{
            left: orb.left,
            top: orb.top,
            width: orb.size,
            height: orb.size,
            opacity: orb.opacity,
            backgroundColor: orb.color,
            animationDuration: orb.animationDuration,
            animationDelay: orb.animationDelay,
            transformOrigin: 'center center'
          }}
        />
      ))}
    </div>
  );
};
