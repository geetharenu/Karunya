import React from "react";
import "./Hero.css";

export default function Hero() {
  return (
    <div className="hero-container">

      {/* Golden Glow Background */}
      <div className="gold-bg" />

      {/* Center Content */}
      <div className="hero-content">

        <h1 className="gold-title">✨ Happy Birthday ✨</h1>

        <h2 className="hero-name">Karunya</h2>

        <button 
          className="enter-btn"
          onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
        >
          Tap to Enter ✨
        </button>

      </div>

      {/* Background music autoplay */}
      <audio autoPlay loop src="/music/birthday.mp3" />

    </div>
  );
}
