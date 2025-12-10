import React from "react";
import "./Gallery.css";

const photos = [
  "/photos/Picsart_25-11-15_09-38-05-606.jpg",
  "/photos/Picsart_25-11-15_09-39-12-019.jpg",
  "/photos/Picsart_25-11-15_09-39-45-846.jpg",
  "/photos/Picsart_25-11-15_09-40-24-586.jpg",
  "/photos/Picsart_25-11-15_09-41-50-080.jpg",
  "/photos/Picsart_25-11-15_09-42-16-449.jpg",
  "/photos/Picsart_25-11-15_09-43-00-858.jpg",
  "/photos/Picsart_25-12-08_19-39-38-891.jpg"
];

const Gallery = () => {
  return (
    <section className="gallery-section">
      <h2 className="gallery-title">✨ Beautiful Memories ✨</h2>

      <div className="gallery-grid">
        {photos.map((img, index) => (
          <div key={index} className="gallery-card">
            <img src={img} alt={`Memory ${index}`} className="gallery-img" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;
