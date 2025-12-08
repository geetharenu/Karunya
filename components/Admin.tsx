
import React, { useState, useRef } from 'react';
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
  const [birthdayDate, setBirthdayDate] = useState(data.config.birthdayDate || '2025-12-09');
  const [showConfetti, setShowConfetti] = useState(data.config.showConfetti);
  const [themeColor, setThemeColor] = useState(data.config.themeColor || '#ec4899');
  
  // Gemini States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTone, setAiTone] = useState('Funny');
  const [aiLang, setAiLang] = useState('English');

  // Photo States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        showConfetti: showConfetti,
        birthdayDate: birthdayDate,
        themeColor: themeColor
      }
    });
    alert('Settings Saved!');
  };

  const hasUnsavedChanges = () => {
    const configName = data.config.birthdayPersonName;
    const configMessage = data.config.mainMessage;
    const configCustomMsg = data.config.customBirthdayMessage || '';
    const configPwd = data.config.adminPassword || 'vengat123';
    const configDate = data.config.birthdayDate || '2025-12-09';
    const configConfetti = data.config.showConfetti;
    const configTheme = data.config.themeColor || '#ec4899';

    return (
      name !== configName ||
      message !== configMessage ||
      customBirthdayMessage !== configCustomMsg ||
      newAdminPassword !== configPwd ||
      birthdayDate !== configDate ||
      showConfetti !== configConfetti ||
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
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
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
             // Compress to JPEG with 0.7 quality (significant size reduction)
             resolve(canvas.toDataURL('image/jpeg', 0.7)); 
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
        alert("Failed to process image. Please try another one.");
      } finally {
        setIsUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = (id: string) => {
    if(window.confirm("Are you sure you want to delete this photo?")) {
        onUpdate({
        ...data,
        photos: data.photos.filter(p => p.id !== id)
        });
    }
  };

  const handleCaptionChange = (id: string, newCaption: string) => {
    // Only update if changed to avoid unnecessary re-renders/writes
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
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Site Admin</h1>
        <button onClick={handleExit} className="text-sm px-4 py-2 border rounded-lg hover:bg-gray-50">
          Exit to Site
        </button>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('config')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${activeTab === 'config' ? 'bg-party-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            Settings & AI
          </button>
          <button 
            onClick={() => setActiveTab('photos')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${activeTab === 'photos' ? 'bg-party-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            Photo Gallery
          </button>
        </div>

        {activeTab === 'config' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 animate-fade-in max-w-3xl">
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Birthday Person Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-party-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Birthday Date (YYYY-MM-DD)</label>
                    <input
                      type="date"
                      value={birthdayDate}
                      onChange={(e) => setBirthdayDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-party-500 outline-none"
                    />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                    <input
                    type="text"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-party-500 outline-none font-mono"
                    placeholder="Set new password"
                    />
                    <p className="text-xs text-gray-500 mt-1">Caution: Remember this password.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={themeColor}
                            onChange={(e) => setThemeColor(e.target.value)}
                            className="h-12 w-20 rounded cursor-pointer border-0 p-0"
                            title="Choose site accent color"
                        />
                        <span className="text-sm text-gray-500 font-mono">{themeColor}</span>
                    </div>
                </div>
              </div>

               {/* Confetti Toggle */}
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visual Effects</label>
                <div 
                  className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setShowConfetti(!showConfetti)}
                >
                  <div className={`relative w-12 h-6 rounded-full p-1 transition-colors duration-300 ${showConfetti ? 'bg-party-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${showConfetti ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Show Butterflies</span>
                </div>
              </div>

              {/* Special Birthday Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Birthday Message</label>
                <textarea
                  value={customBirthdayMessage}
                  onChange={(e) => setCustomBirthdayMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-party-500 outline-none"
                  placeholder="Enter a special featured message for the birthday person..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Main Message (Tamil/English)</label>
                  <span className="text-xs text-party-600 bg-party-50 px-2 py-1 rounded-full">Gemini AI Enabled</span>
                </div>
                <div className="flex gap-2 mb-2 flex-wrap">
                   <select 
                    value={aiTone} 
                    onChange={(e) => setAiTone(e.target.value)}
                    className="text-sm border rounded-md px-2 py-1"
                   >
                     <option value="Heartwarming">Heartwarming</option>
                     <option value="Funny">Funny</option>
                     <option value="Poetic">Poetic</option>
                     <option value="Excited">Excited</option>
                   </select>
                   <select 
                    value={aiLang} 
                    onChange={(e) => setAiLang(e.target.value)}
                    className="text-sm border rounded-md px-2 py-1"
                   >
                     <option value="English">English</option>
                     <option value="Tamil">Tamil</option>
                     <option value="Tanglish">Tanglish</option>
                   </select>
                   <button 
                    onClick={handleGenerateWish}
                    disabled={aiLoading}
                    className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-md flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                   >
                     {aiLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                     Auto-Write
                   </button>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-party-500 outline-none"
                />
              </div>

              <button 
                onClick={handleSaveConfig}
                className="w-full py-3 bg-party-600 text-white font-bold rounded-lg hover:bg-party-700 transition-colors shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-gray-800">Manage Gallery</h2>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 flex items-center gap-2 shadow-sm transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait"
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
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                  <div className="relative h-40 bg-gray-100">
                    <img src={photo.url} alt="thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="bg-red-500 text-white w-10 h-10 rounded-full hover:bg-red-600 flex items-center justify-center transition-transform hover:scale-110 shadow-lg"
                        title="Delete Photo"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="p-3 bg-white flex-1">
                     <textarea
                        defaultValue={photo.caption}
                        onBlur={(e) => handleCaptionChange(photo.id, e.target.value)}
                        placeholder="Write a dialogue or story..."
                        className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:border-party-400 focus:ring-2 focus:ring-party-100 outline-none transition-all placeholder-gray-400 resize-none h-20"
                     />
                  </div>
                </div>
              ))}
              
              {data.photos.length === 0 && (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <div className="text-4xl mb-4 text-gray-300">📸</div>
                  <p className="text-gray-500 font-medium">No memories added yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Click "Add New Memory" to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
