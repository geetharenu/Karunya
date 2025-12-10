import React from "react";

const Hero = () => {
  return (
    <div
      style={{
        padding: "60px 20px",
        textAlign: "center",
        background: "linear-gradient(135deg, #ff9ecd, #ffb8e0)",
        borderRadius: "18px",
        color: "#fff",
        fontSize: "32px",
        fontWeight: "bold",
        boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
        animation: "fadeIn 1.2s ease-out"
      }}
    >
      🎉 Happy Birthday Karunya 🎉 <br />
      <span style={{ fontSize: "22px", fontWeight: "normal" }}>
        You make the world beautiful ✨
      </span>
    </div>
  );
};

export default Hero;
