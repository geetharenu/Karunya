import React from "react";

export default function Hero() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        background: "linear-gradient(135deg, #ff8ec7, #8ec5ff)",
        padding: "20px",
        animation: "fadeIn 1.2s ease-out",
      }}
    >
      <div
        style={{
          backdropFilter: "blur(15px)",
          background: "rgba(255,255,255,0.2)",
          padding: "30px 40px",
          borderRadius: "20px",
          border: "2px solid rgba(255,255,255,0.5)",
          boxShadow: "0 0 25px rgba(255,255,255,0.6)",
          animation: "scaleIn 1.2s ease-out",
        }}
      >
        <h1
          style={{
            fontSize: "45px",
            fontWeight: "bold",
            color: "white",
            textShadow: "0 0 10px #fff",
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
          }}
        >
          Tap to Enter ✨
        </p>
      </div>
    </div>
  );
}
