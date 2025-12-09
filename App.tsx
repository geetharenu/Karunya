
import React, { useState, useEffect } from 'react';
import { Entrance } from './components/Entrance';
import { Lobby } from './components/Lobby';
import { Admin } from './components/Admin';
import { ScratchCard } from './components/ScratchCard';
import { AppData, ViewState } from './types';

const STORAGE_KEY = 'birthday_app_data';

// --- PERMANENT DATA SECTION ---
// To make your Admin changes visible to EVERYONE:
// 1. Go to Admin Panel in the running app.
// 2. Upload photos and change text.
// 3. Click "Get Permanent Code" button in Admin > Settings.
// 4. Copy that code and PASTE it over this entire DEFAULT_DATA constant below.
const DEFAULT_DATA: AppData = {
  config: {
    birthdayPersonName: "Karunya",
    mainMessage: "Welcome to my birthday celebration! I'm so happy you're here to share this special moment with me. Explore the gallery and enjoy the party!",
    customBirthdayMessage: "Happy Birthday! May your day be as wonderful as you are.",
    themeColor: "#ec4899",
    showConfetti: true,
    enableScratchCard: true,
    adminPassword: "vengat123",
    birthdayDate: "2025-12-09"
  },
  photos: [
    {
      id: 'perm-1',
      url: 'https://placehold.co/600x800/0ea5e9/white?text=Blue+Saree+Photo', 
      caption: "Draped in blue, elegance so true 💙\nA timeless grace that shines through 🌟\nHappy Birthday, beautiful you! 👑✨"
    },
    {
      id: 'perm-2',
      url: 'https://placehold.co/600x800/881337/white?text=Maroon+Back+View',
      caption: "A stunning view, a style so grand 🌹\nThe loveliest soul in all the land 🌍\nForever holding your hand! 🤝❤️"
    },
    {
      id: 'perm-3',
      url: 'https://placehold.co/600x800/65a30d/white?text=Green+Nature+Photo',
      caption: "Nature's beauty matches your glow 🌿\nA heart of gold that loves to grow 🌻\nWishing you joy that overflows! 🌊💖"
    },
    {
      id: 'perm-4',
      url: 'https://placehold.co/600x800/9f1239/white?text=Maroon+Side+Pose',
      caption: "In shades of red, you steal the scene 💃\nMy mesmerizing, gorgeous queen 👸\nLiving the sweetest dream! 🍬💤"
    },
    {
      id: 'perm-5',
      url: 'https://placehold.co/600x800/2dd4bf/white?text=Seated+Saree+Photo',
      caption: "Quiet moments, a gentle gaze 👀\nYou brighten up my darkest days ☀️\nLoving you in a million ways! 💯💞"
    },
    {
      id: 'perm-6',
      url: 'https://placehold.co/600x800/84cc16/white?text=Lime+Green+Photo',
      caption: "Vibrant spirit, smile so bright 😁\nYou are my sparkle, my guiding light 💡\nHave a birthday purely delight! 🎉🌈"
    },
    {
      id: 'perm-7',
      url: 'https://placehold.co/600x800/db2777/white?text=Pink+Selfie+Close+Up',
      caption: "Eyes that speak, a smile so sweet 🍭\nYou make my life complete ✅\nMy heart skips a beat! 💓💓"
    },
    {
      id: 'perm-8',
      url: 'https://placehold.co/600x800/f59e0b/white?text=Close+Up+Smile',
      caption: "Golden glow on a special day ✨\nSending love your way 💌\nHip Hip Hooray! 🥳🎂"
    }
  ]
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('ENTRANCE');
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);

  // Load data from LocalStorage on mount
  useEffect(() => {
    let savedData = null;
    try {
      savedData = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      console.warn("LocalStorage access blocked:", e);
    }

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // Robust Merge
        const mergedData: AppData = {
            ...DEFAULT_DATA, 
            ...parsed,       
            config: {
                ...DEFAULT_DATA.config,
                ...(parsed.config || {})
            },
            photos: Array.isArray(parsed.photos) ? parsed.photos : DEFAULT_DATA.photos
        };

        // Legacy fixes
        if (mergedData.config.birthdayPersonName === "Vishwa") mergedData.config.birthdayPersonName = "Karunya";
        if (mergedData.config.themeColor === "pink") mergedData.config.themeColor = "#ec4899";

        setData(mergedData);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data to LocalStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          console.error('LocalStorage quota exceeded');
        } else {
          console.warn('Failed to save data to localStorage', e);
        }
      }
    }
  }, [data, isLoaded]);

  const handleUpdateData = (newData: AppData) => {
    setData(newData);
  };

  const handleEntranceComplete = () => {
    if (data.config.enableScratchCard !== false) {
      setView('SCRATCH');
    } else {
      setView('LOBBY');
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen">
      {view === 'ENTRANCE' && (
        <Entrance 
          name={data.config.birthdayPersonName} 
          onEnter={handleEntranceComplete} 
        />
      )}
      
      {view === 'SCRATCH' && (
        <ScratchCard 
          name={data.config.birthdayPersonName} 
          onComplete={() => setView('LOBBY')} 
        />
      )}
      
      {view === 'LOBBY' && (
        <Lobby 
          data={data} 
          onAdminClick={() => {
            setIsAdminAuth(true);
            setView('ADMIN');
          }} 
        />
      )}

      {view === 'ADMIN' && (
        <Admin 
          data={data} 
          preAuthenticated={isAdminAuth}
          onUpdate={handleUpdateData} 
          onExit={() => {
            setIsAdminAuth(false);
            setView('LOBBY');
          }} 
        />
      )}
    </div>
  );
};

export default App;
