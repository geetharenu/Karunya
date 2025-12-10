import React from "react";

const Hero: React.FC = () => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #ff9a9e, #fad0c4)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        animation: "fadeIn 1.4s ease-out",
      }}
    >
      <h1
        style={{
          fontSize: "48px",
          fontWeight: "bold",
          color: "white",
          letterSpacing: "2px",
          animation: "scaleIn 1.3s ease-out",
        }}
      >
        🎉 Happy Birthday 🎉
      </h1>

      <p
        style={{
          marginTop: "10px",
          fontSize: "28px",
          color: "#fff",
          fontWeight: "600",
          animation: "fadeIn 2s ease-in",
        }}
      >
        Tap to Enter ✨
      </p>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Hero;
