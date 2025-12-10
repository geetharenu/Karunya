import React from "react";
import Hero from "./components/Hero";
import Gallery from "./components/Gallery";
import PremiumWishes from "./components/PremiumWishes";
import "./App.css";

function App() {
  return (
    <div className="premium-app">
      <Hero />
      <Gallery />
      <PremiumWishes />
    </div>
  );
}

export default App;
