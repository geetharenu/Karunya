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
    <div style={{ marginTop: "20px" }}>
      <h2 style={{ marginTop: "20px" }}>Photo Gallery</h2>

      <div
        style={{
          marginTop: "15px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
        }}
      >
        {photos.map((p) => (
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
  );
};

export default Gallery;
