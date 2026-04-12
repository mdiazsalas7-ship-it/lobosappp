import React, { useState, useRef } from 'react';
import { Btn, Modal } from '../components/UIComponents';
import { generateId, saveData, uploadFile, formatDate } from '../utils/helpers';

export default function GalleryPage({ gallery, setGallery }) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const isVideo = file.type.startsWith('video/');
    
    // Subimos el archivo a Firebase Storage en una carpeta específica
    const url = await uploadFile(file, "galeria_lobos");
    
    if (url) {
      const newItem = { 
        id: generateId(), 
        url, 
        isVideo, 
        date: new Date().toISOString(),
        name: file.name 
      };
      const updated = [newItem, ...gallery];
      setGallery(updated);
      await saveData("lobos-gallery", updated);
    }
    
    setIsUploading(false);
    if (fileRef.current) fileRef.current.value = ""; // Limpiamos el input
  };

  const deleteMedia = async (id) => {
    if(!window.confirm("¿Seguro que deseas eliminar este archivo?")) return;
    const updated = gallery.filter(item => item.id !== id);
    setGallery(updated);
    await saveData("lobos-gallery", updated);
    setSelectedMedia(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#c4a35a", letterSpacing: 2, margin: 0 }}>Galería de Entrenamientos</h2>
        
        <div>
          <Btn onClick={() => fileRef.current?.click()} disabled={isUploading}>
            {isUploading ? "⏳ Subiendo..." : "📷 Subir Archivo"}
          </Btn>
          <input type="file" ref={fileRef} hidden accept="image/*,video/*" onChange={handleUpload} />
        </div>
      </div>

      {gallery.length === 0 && !isUploading && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#8888aa", background: "#111122", borderRadius: 16, border: "1px dashed #333355" }}>
          Aún no hay fotos ni videos. ¡Sube el primero!
        </div>
      )}

      {/* Grid estilo Masonry simple */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {gallery.map(item => (
          <div key={item.id} onClick={() => setSelectedMedia(item)} style={{ 
            aspectRatio: "1", borderRadius: 12, overflow: "hidden", cursor: "pointer", 
            background: "#111122", position: "relative", border: "1px solid #222240" 
          }}>
            {item.isVideo ? (
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <video src={item.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}>
                  <span style={{ fontSize: 32 }}>▶️</span>
                </div>
              </div>
            ) : (
              <img src={item.url} alt="Entrenamiento" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
            )}
          </div>
        ))}
      </div>

      {/* Modal para ver la foto/video en grande */}
      <Modal open={!!selectedMedia} onClose={() => setSelectedMedia(null)} title={formatDate(selectedMedia?.date)}>
        {selectedMedia && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {selectedMedia.isVideo ? (
              <video src={selectedMedia.url} controls autoPlay style={{ width: "100%", maxHeight: "60vh", borderRadius: 12, background: "#000" }} />
            ) : (
              <img src={selectedMedia.url} style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: 12 }} />
            )}
            <Btn variant="danger" onClick={() => deleteMedia(selectedMedia.id)} style={{ marginTop: 16, width: "100%" }}>
              🗑 Eliminar Archivo
            </Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}