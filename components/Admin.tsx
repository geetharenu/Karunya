
import React, { useState, useRef, useEffect } from 'react';
import { AppData, Photo } from '../types';
import { generateBirthdayWish } from '../services/geminiService';

interface AdminProps {
  data: AppData;
  onUpdate: (newData: AppData) => void;
  onExit: () => void;
  preAuthenticated?: boolean;
}

export const Admin: React.FC<AdminProps> = ({ data, onUpdate, onExit, preAuthenticated = false }) => {
  const [activeTab, setActiveTab] = useState<'config' | 'photos'>('config');
  const [isAuthenticated, setIsAuthenticated] = useState(preAuthenticated);
  const [password, setPassword] = useState('');
  
  // Config States
  const [name, setName] = useState(data.config.birthdayPersonName);
  const [message, setMessage] = useState(data.config.mainMessage);
  const [customBirthdayMessage, setCustomBirthdayMessage] = useState(data.config.customBirthdayMessage || '');
  const [newAdminPassword, setNewAdminPassword] = useState(data.config.adminPassword || 'vengat123');
  const [googleClientId, setGoogleClientId] = useState(data.config.googleClientId || '');
  const [birthdayDate, setBirthdayDate] = useState(data.config.birthdayDate || '2025-12-09');
  const [showConfetti, setShowConfetti] = useState(data.config.showConfetti);
  const [enableScratchCard, setEnableScratchCard] = useState(data.config.enableScratchCard !== false);
  const [themeColor, setThemeColor] = useState(data.config.themeColor || '#ec4899');
  
  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCode, setExportCode] = useState('');

  // Gemini States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTone, setAiTone] = useState('Funny');
  const [aiLang, setAiLang] = useState('English');

  // Photo States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [photoToReplace, setPhotoToReplace] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [storageUsage, setStorageUsage] = useState<number>(0);

  useEffect(() => {
    calculateStorage();
  }, [data]);

  const calculateStorage = () => {
    try {
        let total = 0;
        // Check if localStorage is available before iterating
        if (typeof localStorage !== 'undefined') {
            for (let key in localStorage) {
              if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2;
              }
            }
        }
        // Convert to MB
        setStorageUsage(total / 1024 / 1024);
    } catch(e) {
        console.warn("Storage calculation failed", e);
        setStorageUsage(0);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPwd = data.config.adminPassword || 'vengat123';
    if (password === currentPwd) { 
      setIsAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const handleSaveConfig = () => {
    onUpdate({
      ...data,
      config: {
        ...data.config,
        birthdayPersonName: name,
        mainMessage: message,
        customBirthdayMessage: customBirthdayMessage,
        adminPassword: newAdminPassword,
        googleClientId: googleClientId,
        showConfetti: showConfetti,
        enableScratchCard: enableScratchCard,
        birthdayDate: birthdayDate,
        themeColor: themeColor
      }
    });
    alert('Settings Saved!');
  };

  const handleGenerateCode = () => {
      // Create current state object
      const currentData: AppData = {
          config: {
              birthdayPersonName: name,
              mainMessage: message,
              customBirthdayMessage: customBirthdayMessage,
              adminPassword: newAdminPassword,
              googleClientId: googleClientId,
              showConfetti: showConfetti,
              enableScratchCard: enableScratchCard,
              birthdayDate: birthdayDate,
              themeColor: themeColor
          },
          photos: data.photos
      };

      const json = JSON.stringify(currentData, null, 2);
      const code = `const DEFAULT_DATA: AppData = ${json};`;
      setExportCode(code);
      setShowExportModal(true);
  };

  const copyToClipboard = () => {
      navigator.clipboard.writeText(exportCode).then(() => {
          alert("Code copied to clipboard! Now paste it into App.tsx replacing the DEFAULT_DATA variable.");
      });
  };

  const hasUnsavedChanges = () => {
    const configName = data.config.birthdayPersonName;
    const configMessage = data.config.mainMessage;
    const configCustomMsg = data.config.customBirthdayMessage || '';
    const configPwd = data.config.adminPassword || 'vengat123';
    const configGoogleId = data.config.googleClientId || '';
    const configDate = data.config.birthdayDate || '2025-12-09';
    const configConfetti = data.config.showConfetti;
    const configScratch = data.config.enableScratchCard !== false;
    const configTheme = data.config.themeColor || '#ec4899';

    return (
      name !== configName ||
      message !== configMessage ||
      customBirthdayMessage !== configCustomMsg ||
      newAdminPassword !== configPwd ||
      googleClientId !== configGoogleId ||
      birthdayDate !== configDate ||
      showConfetti !== configConfetti ||
      enableScratchCard !== configScratch ||
      themeColor !== configTheme
    );
  };

  const handleExit = () => {
    if (hasUnsavedChanges()) {
      const confirmExit = window.confirm(
        'You have unsaved changes in the Settings tab.\n\nAre you sure you want to exit without saving?'
      );
      if (confirmExit) {
        onExit();
      }
    } else {
      onExit();
    }
  };

  const handleFactoryReset = () => {
    const confirmReset = window.confirm(
        "⚠️ FACTORY RESET WARNING ⚠️\n\n" +
        "This will delete ALL local changes and restore the permanent build code settings.\n\n" +
        "Are you sure?"
    );
    if (confirmReset) {
        try {
            localStorage.clear();
        } catch(e) {
            console.warn("Could not clear localStorage", e);
        }
        window.location.reload();
    }
  };

  const handleGenerateWish = async () => {
    setAiLoading(true);
    const wish = await generateBirthdayWish(name, aiTone, aiLang);
    setMessage(wish);
    setAiLoading(false);
  };

  // Optimize image to prevent LocalStorage quota exceeded errors
  const optimizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             // Compress to JPEG with 0.5 quality to significantly reduce size
             resolve(canvas.toDataURL('image/jpeg', 0.5)); 
          } else {
             reject(new Error("Canvas context failed"));
          }
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (storageUsage > 4.5) {
          alert("Storage Warning: You are approaching the browser's storage limit (5MB). Please delete some photos before adding more.");
      }

      setIsUploading(true);
      try {
        const optimizedDataUrl = await optimizeImage(file);
        const newPhoto: Photo = {
          id: Date.now().toString(),
          url: optimizedDataUrl,
          caption: ''
        };
        onUpdate({
          ...data,
          photos: [newPhoto, ...data.photos]
        });
      } catch (error) {
        console.error("Image optimization failed:", error);
        alert("Failed to process image. It might be too large or corrupted.");
      } finally {
        setIsUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleReplaceClick = (id: string) => {
    setPhotoToReplace(id);
    if (replaceInputRef.current) {
        replaceInputRef.current.click();
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && photoToReplace) {
        setIsUploading(true);
        try {
            const optimizedDataUrl = await optimizeImage(file);
            onUpdate({
                ...data,
                photos: data.photos.map(p => 
                    p.id === photoToReplace ? { ...p, url: optimizedDataUrl } : p
                )
            });
        } catch (error) {
            console.error("Image replacement failed:", error);
            alert("Failed to replace image. Please try another one.");
        } finally {
            setIsUploading(false);
            setPhotoToReplace(null);
            if (replaceInputRef.current) replaceInputRef.current.value = '';
        }
    }
  };

  const handleDeletePhoto = (id: string) => {
    if(window.confirm("Are you sure you want to delete this photo? It will be removed from the gallery permanently.")) {
        onUpdate({
        ...data,
        photos: data.photos.filter(p => p.id !== id)
        });
    }
  };

  const handleCaptionChange = (id: string, newCaption: string) => {
    const currentPhoto = data.photos.find(p => p.id === id);
    if (currentPhoto && currentPhoto.caption === newCaption) return;

    onUpdate({
      ...data,
      photos: data.photos.map(p => 
        p.id === id ? { ...p, caption: newCaption } : p
      )
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Access</h2>
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-party-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="button" onClick={onExit} className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Back</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-party-600 text-white rounded-lg hover:bg-party-700">Login</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
           <div className="bg-party-100 p-2 rounded-lg text-party-600">
             <i className="fas fa-tools"></i>
           </div>
           <h1 className="text-xl font-bold text-gray-800">Site Admin</h1>
        </div>
        <button onClick={handleExit} className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <i className="fas fa-external-link-alt"></i> Exit to Site
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('config')}
            className={`px-6 py-3 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 ${activeTab === 'config' ? 'bg-party-600 text-white shadow-party-200' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
          >
            <i className="fas fa-sliders-h"></i> Settings & AI
          </button>
          <button 
            onClick={() => setActiveTab('photos')}
            className={`px-6 py-3 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 ${activeTab === 'photos' ? 'bg-party-600 text-white shadow-party-200' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
          >
            <i className="fas fa-images"></i> Photo Gallery
          </button>
        </div>

        {activeTab === 'config' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 animate-fade-in max-w-3xl border border-gray-100">
            <div className="space-y-8">
              
              {/* General Settings */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">General Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Birthday Person Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-party-500 outline-none transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Birthday Date</label>
                      <input
                        type="date"
                        value={birthdayDate}
                        onChange={(e) => setBirthdayDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-party-500 outline-none transition-all"
                      />
                    </div>
                </div>
              </div>

              {/* Authentication Settings */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                    <i className="fas fa-shield-alt text-party-500"></i> Authentication Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={newAdminPassword}
                                onChange={(e) => setNewAdminPassword(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-party-500 outline-none font-mono transition-all"
                                placeholder="Set new password"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <i className="fas fa-key"></i>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Required for accessing this panel.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Google Client ID (Optional)</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={googleClientId}
                                onChange={(e) => setGoogleClientId(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-party-500 outline-none transition-all"
                                placeholder="Enter OAuth Client ID"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <i className="fab fa-google"></i>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enables "Sign in with Google" button.</p>
                    </div>
                </div>
              </div>

              {/* Visuals */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Visuals & Theme</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={themeColor}
                                onChange={(e) => setThemeColor(e.target.value)}
                                className="h-12 w-20 rounded cursor-pointer border-0 p-0 shadow-sm"
                                title="Choose site accent color"
                            />
                            <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{themeColor}</span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-end gap-2">
                        <div 
                          className="flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors select-none"
                          onClick={() => setShowConfetti(!showConfetti)}
                        >
                          <div className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 ${showConfetti ? 'bg-party-500' : 'bg-gray-300'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${showConfetti ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Show Butterflies & Confetti</span>
                        </div>

                        <div 
                          className="flex items-center gap-3 p-3 border rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors select-none"
                          onClick={() => setEnableScratchCard(!enableScratchCard)}
                        >
                          <div className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 ${enableScratchCard ? 'bg-party-500' : 'bg-gray-300'}`}>
                              <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${enableScratchCard ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Show Scratch Card Page</span>
                        </div>
                    </div>
                </div>
              </div>

              {/* Messaging */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Messages</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Special Birthday Feature Message</label>
                        <textarea
                        value={customBirthdayMessage}
                        onChange={(e) => setCustomBirthdayMessage(e.target.value)}
                        rows={2}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-party-500 outline-none transition-all"
                        placeholder="Enter a special featured message..."
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Main Welcome Message</label>
                            <span className="text-xs text-party-600 bg-party-50 px-2 py-1 rounded-full font-medium"><i className="fas fa-sparkles"></i> AI Enabled</span>
                        </div>
                        <div className="flex gap-2 mb-2 flex-wrap p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <select 
                            value={aiTone} 
                            onChange={(e) => setAiTone(e.target.value)}
                            className="text-sm border rounded-md px-2 py-1 bg-white"
                        >
                            <option value="Heartwarming">Heartwarming</option>
                            <option value="Funny">Funny</option>
                            <option value="Poetic">Poetic</option>
                            <option value="Excited">Excited</option>
                        </select>
                        <select 
                            value={aiLang} 
                            onChange={(e) => setAiLang(e.target.value)}
                            className="text-sm border rounded-md px-2 py-1 bg-white"
                        >
                            <option value="English">English</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Tanglish">Tanglish</option>
                        </select>
                        <button 
                            onClick={handleGenerateWish}
                            disabled={aiLoading}
                            className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-md flex items-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-sm ml-auto"
                        >
                            {aiLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                            Generate with AI
                        </button>
                        </div>
                        <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-party-500 outline-none transition-all"
                        />
                    </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 mt-6 flex flex-col gap-4">
                  <button 
                    onClick={handleSaveConfig}
                    className="w-full py-4 bg-party-600 text-white font-bold rounded-xl hover:bg-party-700 transition-colors shadow-lg active:scale-[0.99]"
                  >
                    Save All Settings (Local Only)
                  </button>
                  
                  {/* Export Button */}
                  <button 
                    onClick={handleGenerateCode}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg active:scale-[0.99] flex justify-center items-center gap-2"
                  >
                    <i className="fas fa-code"></i>
                    Get Permanent Code (Publish)
                  </button>

                  <button 
                    onClick={handleFactoryReset}
                    className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors border border-red-200 text-sm flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-trash-restore"></i>
                    Reset to Permanent Build (Clear Local Data)
                  </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Exporting Code */}
        {showExportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Permanent Code Export</h3>
                        <button onClick={() => setShowExportModal(false)} className="text-gray-500 hover:text-gray-700">
                            <i className="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 mb-4">
                        <strong>Instructions:</strong> To make your photos and changes permanent for all users:
                        <ol className="list-decimal ml-5 mt-1 space-y-1">
                            <li>Click the "Copy Code" button below.</li>
                            <li>Open <code>App.tsx</code> in your code editor.</li>
                            <li>Replace the entire <code>DEFAULT_DATA</code> constant with this code.</li>
                            <li>Deploy your app!</li>
                        </ol>
                    </div>
                    <div className="flex-1 overflow-auto bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <code className="text-xs font-mono text-green-400 break-all whitespace-pre-wrap select-all block">
                            {exportCode}
                        </code>
                    </div>
                    <div className="mt-4 pt-2 border-t flex justify-end">
                        <button 
                            onClick={copyToClipboard}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg"
                        >
                            <i className="fas fa-copy"></i> Copy Code
                        </button>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'photos' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 animate-fade-in border border-gray-100">
            
            {/* Storage Indicator */}
            <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Storage Usage</span>
                    <span className={`text-xs font-bold ${storageUsage > 4 ? 'text-red-500' : 'text-gray-500'}`}>
                        {storageUsage.toFixed(2)} MB / 5.00 MB
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${storageUsage > 4 ? 'bg-red-500' : 'bg-party-500'}`} 
                        style={{ width: `${Math.min(100, (storageUsage / 5) * 100)}%` }}
                    ></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 flex items-start gap-1">
                    <i className="fas fa-info-circle mt-[1px]"></i>
                    <span>
                      Photos are saved permanently in this browser's local storage. 
                      To make them visible to everyone, go to <strong>Settings</strong> and click <strong>Get Permanent Code</strong>.
                    </span>
                </p>
            </div>

            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-800">Manage Gallery ({data.photos.length})</h2>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || storageUsage > 4.8}
                className={`px-6 py-2 rounded-full flex items-center gap-2 shadow-sm transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed ${storageUsage > 4.8 ? 'bg-gray-400 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
              >
                {isUploading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Processing...</>
                ) : (
                    <><i className="fas fa-plus"></i> Add New Memory</>
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <input 
                type="file" 
                ref={replaceInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleReplaceFile}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group hover:shadow-md transition-shadow relative">
                  <div className="relative h-40 bg-gray-100 group">
                    <img src={photo.url} alt="thumbnail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleReplaceClick(photo.id)}
                        className="bg-blue-500 text-white w-10 h-10 rounded-full hover:bg-blue-600 flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
                        title="Change Photo"
                      >
                         <i className="fas fa-sync-alt"></i>
                      </button>
                      <button 
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="bg-red-500 text-white w-10 h-10 rounded-full hover:bg-red-600 flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
                        title="Delete Photo"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-white flex-1 flex flex-col">
                     <textarea
                        defaultValue={photo.caption}
                        onBlur={(e) => handleCaptionChange(photo.id, e.target.value)}
                        placeholder="Write a caption..."
                        className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:border-party-400 focus:ring-2 focus:ring-party-100 outline-none transition-all placeholder-gray-400 resize-none h-20 mb-1"
                     />
                     <div className="mt-auto text-[10px] text-gray-400 text-right">
                         Auto-saved
                     </div>
                  </div>
                </div>
              ))}
              
              {data.photos.length === 0 && (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <div className="text-4xl mb-4 text-gray-300 animate-bounce">📸</div>
                  <p className="text-gray-500 font-medium">No memories added yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Click "Add New Memory" above to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
