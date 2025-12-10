import React, { useState } from "react";
import Hero from "./components/Hero";
import Gallery from "./components/Gallery";

const App: React.FC = () => {
  const [entered, setEntered] = useState(false);

  const photos = [
    { id: "1", url: "/photos/Picsart_25-11-15_09-38-05-606.jpg" },
    { id: "2", url: "/photos/Picsart_25-11-15_09-39-12-019.jpg" },
    { id: "3", url: "/photos/Picsart_25-11-15_09-39-45-846.jpg" },
    { id: "4", url: "/photos/Picsart_25-11-15_09-40-24-586.jpg" },
    { id: "5", url: "/photos/Picsart_25-11-15_09-41-50-080.jpg" },
    { id: "6", url: "/photos/Picsart_25-11-15_09-42-16-449.jpg" },
    { id: "7", url: "/photos/Picsart_25-11-15_09-43-00-858.jpg" },
    { id: "8", url: "/photos/Picsart_25-12-08_19-39-38-891.jpg" }
  ];

  return (
    <div style={{ width: "100%", minHeight: "100vh", overflowX: "hidden" }}>
      
      {/* First Screen - Hero Section */}
      {!entered && (
        <div onClick={() => setEntered(true)} style={{ cursor: "pointer" }}>
          <Hero />
        </div>
      )}

      {/* Second Screen - Gallery Section */}
      {entered && (
        <div style={{ animation: "fadeIn 1.2s ease-out" }}>
          <Gallery photos={photos} />
        </div>
      )}

      {/* Page-level animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
