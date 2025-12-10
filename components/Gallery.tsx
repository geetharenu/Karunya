import React from "react";

interface Photo {
  id: string;
  url: string;
}

interface GalleryProps {
  photos: Photo[];
}

const Gallery: React.FC<GalleryProps> = ({ photos }) => {
  return (
    <div
      style={{
        padding: "20px",
        animation: "fadeIn 1.2s ease-out",
      }}
    >
      <h2
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: "#444",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        📸 Photo Gallery
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "20px",
        }}
      >
        {photos.map((p) => (
          <div
            key={p.id}
            style={{
              overflow: "hidden",
              borderRadius: "15px",
              boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
              animation: "scaleIn 0.8s ease-out",
            }}
          >
            <img
              src={p.url}
              alt="Birthday"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.4s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
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

export default Gallery;
