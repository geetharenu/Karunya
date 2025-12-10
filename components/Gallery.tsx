import "./Gallery.css";

export default function Gallery({ photos }: { photos: any[] }) {
  return (
    <div>
      <h2
        style={{
          marginTop: "20px",
          color: "gold",
          fontSize: "28px",
          fontWeight: "700",
          textAlign: "center",
          textShadow: "0 0 15px gold"
        }}
      >
        📸 Photo Gallery
      </h2>

      <div className="gallery-grid">
        {photos.map((p) => (
          <img
            key={p.id}
            src={p.url}
            className="gallery-photo"
            alt="Birthday Memory"
          />
        ))}
      </div>
    </div>
  );
}
