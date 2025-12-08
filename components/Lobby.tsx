import React, { useState, useEffect, useRef } from 'react';
import { AppData } from '../types';
import { generateBirthdayWish } from '../services/geminiService';
import { Butterflies } from './Butterflies';
import { Countdown } from './Countdown';
import { Bokeh } from './Bokeh';
import { Constellation } from './Constellation';

interface LobbyProps {
  data: AppData;
  onAdminClick: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ data, onAdminClick }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Magic Wish State
  const [magicWish, setMagicWish] = useState('');
  const [isWishing, setIsWishing] = useState(false);

  // Tooltip State
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: '' });

  // Parallax Refs
  const starsRef = useRef<HTMLDivElement>(null);
  const bokehRef = useRef<HTMLDivElement>(null);
  const constellationRef = useRef<HTMLDivElement>(null);
  const galaxyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Theme Handling
  const themeColor = data.config.themeColor || '#ec4899';

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      
      // Parallax Effects
      // Stars: Move background position for infinite looping
      if (starsRef.current) {
        starsRef.current.style.backgroundPositionY = `-${y * 0.1}px`;
      }
      
      // Bokeh: Translate slightly to create depth (slower than foreground)
      if (bokehRef.current) {
        bokehRef.current.style.transform = `translateY(-${y * 0.15}px)`;
      }

      // Constellation: Subtle movement
      if (constellationRef.current) {
        constellationRef.current.style.transform = `translateY(-${y * 0.05}px)`;
      }
      
      // Galaxy: Very subtle vertical shift
      if (galaxyRef.current) {
          galaxyRef.current.style.transform = `translateY(-${y * 0.02}px)`;
      }

      // Video: Subtle parallax
      if (videoRef.current) {
        videoRef.current.style.transform = `translateY(-${y * 0.03}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to vengat123 if not set in config for some reason
    const correctPassword = data.config.adminPassword || 'vengat123';
    
    if (password === correctPassword) {
      setShowLoginModal(false);
      setPassword('');
      onAdminClick();
    } else {
      setError('Incorrect password');
    }
  };

  const handleMagicWish = async () => {
    setIsWishing(true);
    // Randomize tone for variety
    const tones = ['Heartwarming', 'Funny', 'Poetic', 'Excited', 'Inspirational'];
    const randomTone = tones[Math.floor(Math.random() * tones.length)];
    
    const wish = await generateBirthdayWish(data.config.birthdayPersonName, randomTone, 'English');
    setMagicWish(wish);
    setIsWishing(false);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleImageMove = (e: React.MouseEvent, text: string) => {
    if (!text) {
        setTooltip(prev => ({ ...prev, show: false }));
        return;
    }
    setTooltip({
        show: true,
        x: e.clientX,
        y: e.clientY,
        text
    });
  };

  const handleImageLeave = () => {
    setTooltip(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="min-h-screen relative bg-black text-white overflow-hidden">
      {/* Fixed Parallax Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
          {/* Layer 0: Video Background */}
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-[120vh] object-cover opacity-60 will-change-transform"
            style={{ filter: 'brightness(0.6) saturate(1.2)' }}
          >
            {/* Placeholder Galaxy/Nebula Video */}
            <source src="https://cdn.pixabay.com/video/2023/10/22/186115-877660724_large.mp4" type="video/mp4" />
          </video>

          {/* Layer 1: Galaxy Gradient Base - Deep and Slow - Reduced opacity to blend with video */}
          <div ref={galaxyRef} className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-purple-900/60 to-fuchsia-950/80 bg-[length:400%_400%] animate-galaxy mix-blend-overlay will-change-transform"></div>
          
          {/* Layer 2: Nebula Overlay - Lighter, Faster, Reverse Direction for Morphing Effect */}
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-party-500/10 to-blue-500/10 bg-[length:300%_300%] animate-galaxy-fast animate-reverse mix-blend-soft-light"></div>
          
          {/* Constellation / Network Effect */}
          <div ref={constellationRef} className="absolute inset-0 h-[120vh] w-full transform-gpu will-change-transform opacity-60">
             <Constellation themeColor={themeColor} />
          </div>

          {/* Bokeh - Mid layer with Parallax */}
          <div ref={bokehRef} className="absolute inset-0 h-[120vh] w-full transform-gpu will-change-transform">
             <Bokeh themeColor={themeColor} />
          </div>

           {/* Stars - Front layer with Parallax Pattern */}
          <div 
            ref={starsRef}
            className="absolute inset-0 opacity-40 animate-twinkle will-change-transform mix-blend-screen" 
            style={{
                backgroundImage: `
                  radial-gradient(1.5px 1.5px at 20px 30px, white, transparent),
                  radial-gradient(2px 2px at 90px 40px, white, transparent),
                  radial-gradient(1px 1px at 130px 80px, white, transparent),
                  radial-gradient(1.5px 1.5px at 160px 150px, white, transparent),
                  radial-gradient(1px 1px at 210px 100px, white, transparent),
                  radial-gradient(2px 2px at 250px 220px, white, transparent),
                  radial-gradient(1.5px 1.5px at 350px 20px, white, transparent),
                  radial-gradient(1px 1px at 400px 120px, white, transparent),
                  radial-gradient(2px 2px at 500px 300px, white, transparent),
                  radial-gradient(1.5px 1.5px at 600px 50px, white, transparent)
                `,
                backgroundSize: '700px 700px'
            }}
          ></div>
      </div>

      {/* Butterflies Overlay (Handles its own fixed canvas) */}
      {data.config.showConfetti && <Butterflies themeColor={themeColor} />}

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md sticky top-0 z-30 shadow-lg border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => scrollToSection('home')}
          >
            <span className="text-3xl filter drop-shadow-md animate-spin-slow group-hover:scale-110 transition-transform">🪐</span>
            <h1 
                className="text-2xl font-script text-white font-bold"
                style={{ textShadow: `0 2px 10px ${themeColor}` }}
            >
              {data.config.birthdayPersonName}'s Universe
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
                onClick={() => scrollToSection('home')}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest hover:scale-105"
            >
                Home
            </button>
            <button 
                onClick={() => scrollToSection('gallery')}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest hover:scale-105"
            >
                Memories
            </button>
            <button 
                onClick={() => scrollToSection('wishes')}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest hover:scale-105"
            >
                Wishes
            </button>
          </nav>

          <button 
            onClick={() => setShowLoginModal(true)}
            className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            style={{ 
                '--hover-color': themeColor 
            } as React.CSSProperties}
            title="Admin Login"
          >
            <i className="fas fa-cog hover:rotate-90 transition-transform duration-500"></i>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 relative z-10">
        
        {/* Hero Message */}
        <section id="home" className="text-center space-y-6 animate-slide-up scroll-mt-28">
          <div className="inline-block p-[2px] rounded-full bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md">
            <div className="rounded-full px-6 py-2 border border-white/10">
              <span 
                className="font-semibold tracking-wide uppercase text-sm"
                style={{ color: themeColor }}
              >
                Let's Celebrate
              </span>
            </div>
          </div>
          <p className="text-2xl md:text-4xl text-white/90 leading-relaxed font-light max-w-4xl mx-auto drop-shadow-lg">
            {data.config.mainMessage}
          </p>
          
          {/* Countdown Clock */}
          <div className="mt-8">
            <Countdown targetDate={data.config.birthdayDate} />
          </div>
        </section>

        {/* Gallery Grid */}
        <section id="gallery" className="scroll-mt-28">
          <div className="flex items-center gap-4 mb-8">
            <h2 
                className="text-3xl font-bold text-white drop-shadow-md"
                style={{ textShadow: `0 0 20px ${themeColor}80` }}
            >
                Starry Memories
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/50 to-transparent"></div>
          </div>
          
          {data.photos.length === 0 ? (
            <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-3xl border border-white/20">
              <p className="text-white/50 text-lg">No photos uploaded yet. Go to Admin to add memories!</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {data.photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className="gallery-card break-inside-avoid group cursor-pointer animate-float"
                  style={{ 
                    animationDelay: `${index * 1.5}s`, // Stagger the floating animation
                    animationDuration: '6s',
                    transform: `rotate(${index % 2 === 0 ? '1deg' : '-1deg'})`,
                  }}
                >
                  <div 
                    className="overflow-hidden bg-gray-100 mb-4 aspect-auto rounded-md"
                    onMouseMove={(e) => handleImageMove(e, photo.caption)}
                    onMouseLeave={handleImageLeave}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.caption} 
                      className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110 contrast-[1.1] saturate-[1.1]"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Polaroid Style Caption */}
                  <div className="absolute bottom-3 left-0 w-full text-center px-2 pointer-events-none">
                    {photo.caption && (
                       <p className="font-shadows text-gray-800 text-xl leading-tight mb-1">
                         {photo.caption}
                       </p>
                    )}
                     <p className="font-script text-lg opacity-80" style={{ color: themeColor }}>
                        Wishing you the best!
                     </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Wishes Section */}
        <section id="wishes" className="pb-20 scroll-mt-28">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] flex-1 bg-gradient-to-l from-white/50 to-transparent"></div>
            <h2 
                className="text-3xl font-bold text-white drop-shadow-md"
                style={{ textShadow: `0 0 20px ${themeColor}80` }}
            >
                Cosmic Wishes
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/50 to-transparent"></div>
          </div>
          
          {/* Featured Custom Message */}
          {data.config.customBirthdayMessage && (
            <div className="mb-8 animate-fade-in">
              <div 
                className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 text-center relative overflow-hidden group hover:bg-white/15 transition-all duration-500"
                style={{ 
                    boxShadow: `0 0 40px -10px ${themeColor}60`,
                    borderColor: `${themeColor}40`
                }}
              >
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"></div>
                 <i className="fas fa-star text-2xl mb-4 animate-pulse-glow" style={{ color: themeColor }}></i>
                 <p className="font-script text-3xl md:text-5xl leading-relaxed drop-shadow-lg text-white">
                    "{data.config.customBirthdayMessage}"
                 </p>
                 <div className="mt-4 flex justify-center gap-2 text-white/40 text-sm">
                    <span>•</span><span>•</span><span>•</span>
                 </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-6">
             {/* AI Magic Wish Generator */}
             <div 
                className="w-full md:max-w-md p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-white/20"
                style={{ 
                    background: `linear-gradient(135deg, ${themeColor}aa, #4c1d95)`,
                    boxShadow: `0 10px 30px -10px ${themeColor}80`
                }}
             >
                {/* Dynamic Border Glow Effect */}
                <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 20px ${themeColor}` }}
                ></div>

                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="relative z-10 h-full flex flex-col">
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <i className="fas fa-magic text-yellow-300 animate-pulse"></i> Magic Wish
                  </h3>
                  
                  {!magicWish ? (
                    <>
                      <p className="text-purple-100 text-sm mb-6 flex-grow">Can't find the right words? Let AI write a message from the stars!</p>
                      <button 
                          onClick={handleMagicWish}
                          disabled={isWishing}
                          className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 border border-white/30 shadow-lg"
                      >
                          {isWishing ? (
                              <><i className="fas fa-spinner fa-spin"></i> Consulting stars...</>
                          ) : (
                              <>Generate Wish ✨</>
                          )}
                      </button>
                    </>
                  ) : (
                    <div className="animate-fade-in flex flex-col h-full">
                      <div className="flex-grow flex items-center justify-center">
                        <p className="font-script text-2xl leading-relaxed text-center drop-shadow-md">"{magicWish}"</p>
                      </div>
                      <div className="mt-4 flex justify-center">
                         <button 
                            onClick={() => setMagicWish('')}
                            className="text-xs text-white/70 hover:text-white underline decoration-dotted underline-offset-4"
                        >
                            Generate Another
                        </button>
                      </div>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </section>
      </main>

      <footer className="bg-black/30 backdrop-blur-md py-8 text-center text-gray-400 text-sm relative z-10 border-t border-white/5">
        <p>Made with ❤️ for {data.config.birthdayPersonName}</p>
      </footer>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
            
            <div className="text-center mb-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
                style={{ backgroundColor: `${themeColor}20`, color: themeColor }}
              >
                <i className="fas fa-lock"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Admin Access</h3>
              <p className="text-sm text-gray-500">Enter password to continue</p>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div className="mb-6">
                <input
                  type="password"
                  placeholder="Password"
                  autoFocus
                  className={`w-full p-3 border rounded-lg outline-none focus:ring-2 transition-all text-center tracking-widest text-gray-800 ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                />
                {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
              </div>
              
              <button 
                type="submit" 
                className="w-full text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] shadow-lg active:scale-95"
                style={{ backgroundColor: themeColor }}
              >
                Enter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip.show && (
          <div 
              className="fixed z-[100] pointer-events-none px-4 py-2 bg-gray-900/90 backdrop-blur text-white text-xs md:text-sm rounded-lg shadow-xl border border-white/10 whitespace-pre-wrap max-w-[250px] font-sans"
              style={{ 
                  left: tooltip.x + 16, 
                  top: tooltip.y + 16,
              }}
          >
              {tooltip.text}
          </div>
      )}
    </div>
  );
};