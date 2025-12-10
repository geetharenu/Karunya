import { useState } from "react";
import Hero from "./components/Hero";
import Gallery from "./components/Gallery";

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
  config: {
    birthdayPersonName: "Karunya",
    mainMessage: "Welcome to my birthday celebration!",
    customBirthdayMessage: "Happy Birthday! May your day sparkle! ✨",
    adminPassword: "vengat123",
    googleClientId: "",
    showConfetti: true,
    enableScratchCard: true,
    birthdayDate: "2025-12-09",
    themeColor: "#ec4899",
  },

  photos: [
    { id: "1", url: "/photos/Picsart_25-11-15_09-01-01.jpg" },
    { id: "2", url: "/photos/Picsart_25-11-15_09-01-02.jpg" },
    { id: "3", url: "/photos/Picsart_25-11-15_09-01-03.jpg" },
    { id: "4", url: "/photos/Picsart_25-11-15_09-01-04.jpg" },
    { id: "5", url: "/photos/Picsart_25-11-15_09-01-05.jpg" },
    { id: "6", url: "/photos/Picsart_25-11-15_09-01-06.jpg" }
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
          🎉 Happy Birthday 🎉
        </h1>

        <h2
          style={{
            fontSize: "32px",
            marginTop: "10px",
            fontWeight: "bold",
          }}
        >
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
          Tap to Enter ✨
        </button>

        {/* Music Autoplay */}
        <audio id="bgm" src="/music/birthday.mp3" autoPlay loop hidden />
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <div style={{ padding: "20px" }}>
        <h1 style={{ color: data.config.themeColor }}>
          {data.config.customBirthdayMessage}
        </h1>

        <p style={{ marginTop: "10px" }}>{data.config.mainMessage}</p>

        {/* Photo Gallery */}
        <Gallery photos={data.photos} />
      </div>
    </>
  );
}

// extra line
