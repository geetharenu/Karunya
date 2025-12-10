import React from "react";
import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero-section">

      {/* Background Music */}
      <audio autoPlay loop src="/music/birthday.mp3" />

      {/* Gold Particle Animation */}
      <div className="gold-particles"></div>

      {/* Main Content */}
      <div className="hero-content">
        <h1 className="hero-title">Happy Birthday Karunya 🎉✨</h1>
        <p className="hero-sub">You Make Every Moment Magical 💖</p>

        <img
          src="/photos/hero.jpg"
          alt="Karunya"
          className="hero-photo"
        />
      </div>
    </section>
  );
};

export default Hero;
