import React, { useState } from 'react';

interface EntranceProps {
  onEnter: () => void;
  name: string;
}

export const Entrance: React.FC<EntranceProps> = ({ onEnter, name }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleEnter = () => {
    setIsOpening(true);
    // Wait for animation before switching view
    setTimeout(() => {
      onEnter();
    }, 1000);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-party-900 via-party-700 to-party-900 transition-opacity duration-1000 ease-in-out ${isOpening ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="text-center p-8 max-w-2xl relative">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 text-gold-400 text-4xl animate-bounce-slow">✨</div>
          <div className="absolute bottom-20 right-10 text-gold-400 text-3xl animate-bounce-slow" style={{ animationDelay: '1s' }}>🎉</div>
          <div className="absolute top-1/2 right-20 text-white text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>🎈</div>
        </div>

        <h1 className="text-6xl md:text-8xl font-script text-white mb-6 drop-shadow-lg animate-fade-in">
          Happy Birthday
        </h1>
        <h2 className="text-4xl md:text-5xl font-bold text-gold-400 mb-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {name}
        </h2>
        
        <button
          onClick={handleEnter}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-party-900 transition-all duration-200 bg-white font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:scale-105 animate-slide-up shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          style={{ animationDelay: '0.6s' }}
        >
          <span className="mr-2">Tap to Enter</span>
          <i className="fas fa-door-open group-hover:translate-x-1 transition-transform"></i>
          <div className="absolute -inset-3 rounded-full bg-white opacity-20 group-hover:opacity-40 blur-lg transition duration-200"></div>
        </button>
      </div>
    </div>
  );
};