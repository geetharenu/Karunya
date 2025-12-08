
import React, { useState, useEffect } from 'react';
import { Entrance } from './components/Entrance';
import { Lobby } from './components/Lobby';
import { Admin } from './components/Admin';
import { ScratchCard } from './components/ScratchCard';
import { AppData, ViewState } from './types';

const STORAGE_KEY = 'birthday_app_data';

const DEFAULT_DATA: AppData = {
  config: {
    birthdayPersonName: "Karunya",
    mainMessage: "Welcome to my birthday celebration! I'm so happy you're here to share this special moment with me. Explore the gallery and enjoy the party!",
    customBirthdayMessage: "Happy Birthday! May your day be as wonderful as you are.", // Default value
    themeColor: "#ec4899", // Default Pink-500
    showConfetti: true,
    adminPassword: "vengat123",
    birthdayDate: "2025-12-09"
  },
  photos: []
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('ENTRANCE');
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);

  // Load data from LocalStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Ensure default name is updated even if config exists but is default
        if (parsed.config && parsed.config.birthdayPersonName === "Vishwa") {
             parsed.config.birthdayPersonName = "Karunya";
        }
        // Ensure adminPassword exists for older saves
        if (parsed.config && !parsed.config.adminPassword) {
            parsed.config.adminPassword = "vengat123";
        }
        // Ensure birthdayDate exists for older saves
        if (parsed.config && !parsed.config.birthdayDate) {
            parsed.config.birthdayDate = "2025-12-09";
        }
        // Ensure customBirthdayMessage exists for older saves
        if (parsed.config && !parsed.config.customBirthdayMessage) {
            parsed.config.customBirthdayMessage = "Happy Birthday! May your day be as wonderful as you are.";
        }
        // Normalize themeColor if it's the old "pink" string
        if (parsed.config && parsed.config.themeColor === "pink") {
            parsed.config.themeColor = "#ec4899";
        }
        setData(parsed);
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
          alert('Storage Limit Reached! \n\nThe browser storage is full. Please delete some old photos or use smaller images to ensure new changes are saved permanently.');
          console.error('LocalStorage quota exceeded');
        } else {
          console.error('Failed to save data', e);
        }
      }
    }
  }, [data, isLoaded]);

  const handleUpdateData = (newData: AppData) => {
    setData(newData);
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen">
      {view === 'ENTRANCE' && (
        <Entrance 
          name={data.config.birthdayPersonName} 
          onEnter={() => setView('SCRATCH')} 
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
