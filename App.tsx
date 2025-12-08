
import React, { useState, useEffect } from 'react';
import { Entrance } from './components/Entrance';
import { Lobby } from './components/Lobby';
import { Admin } from './components/Admin';
import { ScratchCard } from './components/ScratchCard';
import { AppData, ViewState } from './types';

const STORAGE_KEY = 'birthday_app_data';

// TO MAKE PHOTOS PERMANENT FOR EVERYONE:
// Replace the URLs below with your own image URLs (e.g., from an image hosting site like Imgur, Cloudinary, or S3).
// Since this is a static app without a backend database, these 'default' photos serve as the permanent build content.
const DEFAULT_DATA: AppData = {
  config: {
    birthdayPersonName: "Karunya",
    mainMessage: "Welcome to my birthday celebration! I'm so happy you're here to share this special moment with me. Explore the gallery and enjoy the party!",
    customBirthdayMessage: "Happy Birthday! May your day be as wonderful as you are.",
    themeColor: "#ec4899",
    showConfetti: true,
    adminPassword: "vengat123",
    birthdayDate: "2025-12-09"
  },
  photos: [
    {
      id: 'perm-1',
      url: 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?auto=format&fit=crop&q=80&w=800',
      caption: 'Let the party begin! 🎉'
    },
    {
      id: 'perm-2',
      url: 'https://images.unsplash.com/photo-1464349153912-6b4b3700a15e?auto=format&fit=crop&q=80&w=800',
      caption: 'Sweetest wishes for you 🎂'
    },
    {
      id: 'perm-3',
      url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800',
      caption: 'Soaring high! 🎈'
    },
    {
      id: 'perm-4',
      url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=800',
      caption: 'Cheers to another great year! 🥂'
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
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // Robust Merge: Ensure we have all fields even if localStorage is old
        const mergedData: AppData = {
            ...DEFAULT_DATA, // Start with defaults
            ...parsed,       // Overwrite with saved
            config: {
                ...DEFAULT_DATA.config,
                ...(parsed.config || {})
            },
            // Logic for photos: 
            // If parsed.photos is undefined/null (old data), use DEFAULT_DATA.photos.
            // If parsed.photos is [], it means user deleted them, so we keep [].
            photos: Array.isArray(parsed.photos) ? parsed.photos : DEFAULT_DATA.photos
        };

        // Fix specific legacy values if they exist
        if (mergedData.config.birthdayPersonName === "Vishwa") {
             mergedData.config.birthdayPersonName = "Karunya";
        }
        if (mergedData.config.themeColor === "pink") {
            mergedData.config.themeColor = "#ec4899";
        }

        setData(mergedData);
      } catch (e) {
        console.error("Failed to parse saved data", e);
        // If parsing fails, we fall back to DEFAULT_DATA (already set in state)
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
          // Alert handled in Admin component mostly, but good to catch here silently or log
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
