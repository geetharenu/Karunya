
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
    mainMessage:
      "Welcome to my birthday celebration! I'm so happy you're here to share this special moment with me. Explore the gallery and enjoy the party!",
    customBirthdayMessage:
      "Happy Birthday! May your day be as wonderful as you are.",
    adminPassword: "vengat123",
    googleClientId: "",
    showConfetti: true,
    enableScratchCard: true,
    birthdayDate: "2025-12-09",
    themeColor: "#ec4899",
  },

  photos: [
    {
      id: "perm-1",
      url: "data:image/jpeg;base64,PASTE_MAIN_IMAGE_HERE",
      caption: "Karunya Birthday Photo 1"
    },
    {
      id: "perm-2",
      url: "data:image/jpeg;base64,PASTE_SECOND_IMAGE_HERE",
      caption: "Karunya Birthday Photo 2"
    },
    {
      id: "perm-3",
      url: "data:image/jpeg;base64,PASTE_THIRD_IMAGE_HERE",
      caption: "Karunya Birthday Photo 3"
    }
    // மேலும் வேண்டுமானால் இதே format-ல் சேர்க்கலாம்
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
