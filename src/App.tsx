
import { useState } from "react";
import Hero from "./components/Hero";

interface Photo {
  id: string;
  url: string;
}

interface AppData {
  config: {
    birthdayPersonName: string;
    mainMessage: string;
    customBirthdayMessage: string;
    adminPassword: string;
    googleClientId: string;
    showConfetti: boolean;
    enableScratchCard: boolean;
    birthdayDate: string;
    themeColor: string;
  };
  photos: Photo[];
}

const DEFAULT_DATA: AppData = {
  "config": {
    "birthdayPersonName": "Karunya",
    "mainMessage": "Welcome to my birthday celebration! I'm so happy you're here to share this special moment with me. Explore the gallery and enjoy the party!",
    "customBirthdayMessage": "Happy Birthday! May your day be as wonderful as you are.",
    "adminPassword": "vengat123",
    "googleClientId": "",
    "showConfetti": true,
    "enableScratchCard": true,
    "birthdayDate": "2025-12-09",
    "themeColor": "#ec4899"
  },
  "photos": [
    {
      "id": "perm-1",
      "url":
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
    }
  ]
};

export default function App() {
  const data = DEFAULT_DATA;
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return (
      <div
        style={{
          height: "100vh",
          background: data.config.themeColor,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "40px", fontWeight: "bold" }}>
          🎉 Happy Birthday
        </h1>
        <h2 style={{ fontSize: "32px", marginTop: "10px" }}>
          {data.config.birthdayPersonName}
        </h2>

        <button
          onClick={() => setEntered(true)}
          style={{
            marginTop: "30px",
            padding: "15px 30px",
            background: "white",
            color: "#000",
            borderRadius: "10px",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          Tap to Enter 🚪
        </button>
      </div>
    );
  }

  
}
return (
  <>
    <Hero />

    <div style={{ padding: "20px" }}>
      <h1 style={{ color: data.config.themeColor }}>
        {data.config.customBirthdayMessage}
      </h1>
      <p style={{ marginTop: "10px" }}>{data.config.mainMessage}</p>

      <h2 style={{ marginTop: "20px" }}>Photo Gallery</h2>

      <div
        style={{
          marginTop: "15px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
        }}
      >
        {data.photos.map((p) => (
          <img
            key={p.id}
            src={p.url}
            alt="Birthday"
            style={{
              width: "100%",
              borderRadius: "15px",
              boxShadow: "0 0 10px #0003",
            }}
          />
        ))}
      </div>
    </div>
  </>
);
