
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

  // Notification State
  const [showNotification, setShowNotification] = useState(false);

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

  // --- Notification Logic ---
  useEffect(() => {
    // 1. Request Browser Notification Permission on mount
    try {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission().catch(e => console.log("Notification permission denied or dismissed", e));
        }
    } catch(e) {
        console.warn("Notification API not supported or blocked", e);
    }

    const checkTime = () => {
        // Parse config date (YYYY-MM-DD)
        if (!data.config.birthdayDate) return;

        const parts = data.config.birthdayDate.split('-');
        if (parts.length !== 3) return;
        
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        
        // Target: 12:00 AM (00:00:00) on the birthday
        const birthdayTime = new Date(year, month - 1, day, 0, 0, 0);
        const now = new Date();

        // Check if current time is past the birthday time
        if (now >= birthdayTime) {
            try {
                // Safely access sessionStorage
                let seen = null;
                try {
                    seen = sessionStorage.getItem('birthday_notification_seen');
                } catch (e) {
                    console.warn("SessionStorage access blocked");
                }

                if (!seen) {
                    // Show In-App Toast
                    setShowNotification(true);
                    try {
                        sessionStorage.setItem('birthday_notification_seen', 'true');
                    } catch (e) { /* ignore */ }
                    
                    // Show Browser Notification
                    if ("Notification" in window && Notification.permission === "granted") {
                        try {
                            new Notification(`Happy Birthday ${data.config.birthdayPersonName}! 🎂`, {
                                body: "It's 12:00 AM! Wishing you a magical day filled with joy!",
                                icon: "https://cdn-icons-png.flaticon.com/512/2488/2488980.png"
                            });
                        } catch (e) {
                            console.error("Notification failed", e);
                        }
                    }
                }
            } catch (e) {
                // Fallback safe mode
                console.log("Notification check skipped due to error");
            }
        }
    };

    // Check immediately
    checkTime();
    
    // Check every 10 seconds to catch the 12am transition relatively quickly
    const interval = setInterval(checkTime, 10000);

    return () => clearInterval(interval);
  }, [data.config.birthdayDate, data.config.birthdayPersonName]);


  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      
      // Parallax Effects with safety checks
      if (starsRef.current) {
        starsRef.current.style.backgroundPositionY = `-${y * 0.1}px`;
      }
      
      if (bokehRef.current) {
        bokehRef.current.style.transform = `translateY(-${y * 0.15}px)`;
      }

      if (constellationRef.current) {
        constellationRef.current.style.transform = `translateY(-${y * 0.05}px)`;
      }
      
      if (galaxyRef.current) {
          galaxyRef.current.style.transform = `translateY(-${y * 0.02}px)`;
      }

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

  const handleGoogleLogin = () => {
      if (data.config.googleClientId) {
          alert("Google Sign-In integration would initialize here with Client ID: " + data.config.googleClientId + ". (Demo Only)");
      } else {
          alert("Google Sign-In is not configured. Please use the password 'vengat123' (or your custom password) to login, then configure Google ID in settings.");
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

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-24 right-4 md:right-8 z-50 animate-slide-up">
            <div 
                className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl max-w-sm flex items-start gap-4 relative overflow-hidden"
                style={{ borderColor: `${themeColor}40` }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
                <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-lg relative z-10 animate-bounce-slow"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, #fbbf24)` }}
                >
                    <span className="text-2xl filter drop-shadow">🎂</span>
                </div>
                <div className="relative z-10 flex-1">
                    <h4 className="font-bold text-white text-lg leading-tight mb-1">It's 12:00 AM! 🕛</h4>
                    <p className="text-white/80 text-sm">
                        Happy Birthday {data.config.birthdayPersonName}! 🎉 The stars are shining just for you today!
                    </p>
                </div>
                <button 
                    onClick={() => setShowNotification(false)}
                    className="text-white/50 hover:text-white relative z-10 transition-colors"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>
        </div>
      )}

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
                    className="overflow-hidden bg-gray-100 mb-4 aspect-auto rounded-md shadow-inner"
                    onMouseMove={(e) => handleImageMove(e, photo.caption)}
                    onMouseLeave={handleImageLeave}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.caption} 
                      className="w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110 contrast-125 brightness-110 saturate-[1.2]"
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

      {/* Admin Login Modal - Enhanced */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
             {/* Decorative Top Bar */}
             <div className="absolute top-0 left-0 w-full h-2" style={{ background: `linear-gradient(90deg, ${themeColor}, #fbbf24)` }}></div>
            
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
            
            <div className="text-center mb-8 mt-2">
              <div className="inline-block p-3 rounded-full bg-gray-50 mb-4 shadow-sm">
                 <img src="https://cdn-icons-png.flaticon.com/512/9322/9322127.png" alt="Lock" className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Welcome Back</h3>
              <p className="text-sm text-gray-500">Sign in to manage the celebration</p>
            </div>

            {/* Google Sign-In Button */}
            <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-all duration-200 mb-6 shadow-sm group"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Sign in with Google</span>
            </button>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500 font-medium">or with password</span>
                </div>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <i className="fas fa-key"></i>
                </div>
                <input
                  type="password"
                  placeholder="Enter Admin Password"
                  autoFocus
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none focus:ring-2 transition-all text-gray-800 ${error ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-300 focus:ring-party-200'}`}
                  style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                />
                {error && <p className="text-red-500 text-xs mt-2 ml-1 flex items-center gap-1"><i className="fas fa-exclamation-circle"></i> {error}</p>}
              </div>
              
              <button 
                type="submit" 
                className="w-full text-white font-bold py-3 rounded-xl transition-all hover:scale-[1.02] shadow-lg active:scale-95 flex justify-center items-center gap-2"
                style={{ backgroundColor: themeColor }}
              >
                <span>Continue</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </form>
            
            <p className="text-center text-xs text-gray-400 mt-6">
                Protected Area • Authorized Personnel Only
            </p>
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
