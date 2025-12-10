import React from "react";

interface Photo {
  id: string;
  url: string;
}

interface GalleryProps {
  photos: Photo[];
}

export default function Gallery({ photos }: GalleryProps) {
  return (
    <div
      style={{
        marginTop: "20px",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "25px",
        padding: "20px",
      }}
    >
      {photos.map((p) => (
        <img
          key={p.id}
          src={p.url}
          alt="Birthday"
          style={{
            width: "100%",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)";
            e.currentTarget.style.filter = "brightness(1.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
            e.currentTarget.style.filter = "brightness(1)";
          }}
        />
      ))}
    </div>
  );
}
