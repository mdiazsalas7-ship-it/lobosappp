import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { StatCard, Avatar, Modal, Btn, WolfLogo } from '../components/UIComponents';
import BirthdayCard from '../components/BirthdayCard';
import { getBirthdaysThisMonth, getDaysUntilBirthday, getAge, formatDate, saveData } from '../utils/helpers';

export default function DashboardPage({ athletes, payments, news, gallery = [], setTab, setAthletes }) {
  const [selectedBday, setSelectedBday] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cardRef = useRef(null);

  const total = athletes.length;
  const active = athletes.filter(a => a.status === "activo").length;
  const morosos = athletes.filter(a => {
    const p = payments.filter(pp => pp.athleteId === a.id);
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
    return !p.some(pp => pp.month === currentMonth);
  }).length;
  
  const bdays = getBirthdaysThisMonth(athletes).sort((a, b) => 
    getDaysUntilBirthday(a.birthDate) - getDaysUntilBirthday(b.birthDate)
  );

  // Función para capturar y compartir la barajita desde el Dashboard
  const shareBirthdayCard = async () => {
    if (!cardRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(cardRef.current, { 
        useCORS: true, 
        backgroundColor: '#0a0a1a',
        scale: 2 
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Cumpleanos_Lobos_${selectedBday.name.replace(/\s+/g, '_')}.png`;
      link.click();
    } catch (error) {
      console.error("Error al generar la imagen:", error);
    }
    setIsCapturing(false);
  };

  return (
    <div>
      <style>{`
        @keyframes pulseBday {
          0% { border-color: #c4a35a; box-shadow: 0 0 0 0 rgba(196, 163, 90, 0.4); }
          70% { border-color: #ffcc00; box-shadow: 0 0 0 10px rgba(196, 163, 90, 0); }
          100% { border-color: #c4a35a; box-shadow: 0 0 0 0 rgba(196, 163, 90, 0); }
        }
        .bday-card-today {
          animation: pulseBday 2s infinite;
          border: 1px solid #c4a35a !important;
          background: linear-gradient(135deg, #111122 0%, #1a1a3a 100%) !important;
        }
      `}</style>

      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#c4a35a", letterSpacing: 2, marginBottom: 20 }}>Panel Principal</h2>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <StatCard icon="🐺" label="Total Atletas" value={total} onClick={() => setTab("Atletas")} />
        <StatCard icon="✅" label="Activos" value={active} color="#44cc88" onClick={() => setTab("Atletas")} />
        <StatCard icon="⚠️" label="Morosos este mes" value={morosos} color="#ee5566" onClick={() => setTab("Administrativo")} />
        {/* TARJETA DE GALERÍA REEMPLAZANDO LA DE CUMPLEAÑOS */}
        <StatCard icon="📸" label="Fotos y Videos" value={gallery.length} color="#bb88ff" onClick={() => setTab("Galeria")} />
      </div>

      {/* CONTENEDOR EN GRID PARA CUMPLEAÑOS Y GALERÍA */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 20 }}>
        
        {bdays.length > 0 && (
          <div style={{ background: "#111122", borderRadius: 16, padding: 20, border: "1px solid #222240" }}>
            <h3 style={{ color: "#6699ff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, margin: "0 0 14px" }}>🎂 Próximos Cumpleaños</h3>
            {/* Limitamos a los primeros 4 para que no sea muy largo */}
            {bdays.slice(0, 4).map(a => {
              const days = getDaysUntilBirthday(a.birthDate);
              const isToday = days === 0;
              
              return (
                <div key={a.id} className={isToday ? "bday-card-today" : ""} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, padding: "10px 14px", borderRadius: 12, background: "#0d0d1a", border: "1px solid transparent" }}>
                  <Avatar src={a.photo} name={a.name} size={42} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: isToday ? "#c4a35a" : "#ddd", fontSize: 15 }}>
                      {a.name} {isToday && "🎈"}
                    </div>
                    <div style={{ fontSize: 12, color: "#8888aa" }}>
                      {formatDate(a.birthDate)} — cumple {getAge(a.birthDate) + (isToday ? 0 : 1)} años
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: isToday ? "#ffcc00" : "#6699ff", fontWeight: 800, marginBottom: 4 }}>
                      {isToday ? "¡HOY! 🎉" : `en ${days} día${days > 1 ? "s" : ""}`}
                    </div>
                    {isToday && (
                      <button 
                        onClick={() => setSelectedBday(a)}
                        style={{ background: '#c4a35a', border: 'none', borderRadius: 6, color: '#000', fontSize: 10, padding: '4px 8px', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase' }}
                      >
                        Ver Barajita
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* VISTA PREVIA DE LA GALERÍA */}
        {gallery.length > 0 && (
          <div style={{ background: "#111122", borderRadius: 16, padding: 20, border: "1px solid #222240" }}>
            <h3 style={{ color: "#bb88ff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, margin: "0 0 14px" }}>📸 Últimos Archivos</h3>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10 }}>
              {gallery.slice(0, 4).map(item => (
                <div key={item.id} onClick={() => setTab("Galeria")} style={{ width: 100, height: 100, flexShrink: 0, borderRadius: 12, overflow: "hidden", cursor: "pointer", position: "relative", border: "1px solid #333355" }}>
                  {item.isVideo ? (
                    <video src={item.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <img src={item.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Noticias rápidas */}
      <h3 style={{ color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, margin: "0 0 12px" }}>Últimas Noticias</h3>
      {news.slice(0, 3).map(n => (
        <div key={n.id} style={{ background: "#111122", borderRadius: 14, padding: "14px 18px", marginBottom: 10, border: "1px solid #222240" }}>
          <div style={{ fontSize: 11, color: "#6699ff", marginBottom: 4 }}>{formatDate(n.date)}</div>
          <div style={{ fontWeight: 700, color: "#ddd", marginBottom: 4 }}>{n.title}</div>
          <div style={{ fontSize: 13, color: "#8888aa" }}>{n.body.slice(0, 100)}...</div>
        </div>
      ))}

      {/* Modal para mostrar la barajita y compartirla desde el Dashboard */}
      <Modal open={!!selectedBday} onClose={() => setSelectedBday(null)} title="">
        {selectedBday && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: 20, width: '100%', display: 'flex', justifyContent: 'center' }}>
              <BirthdayCard athlete={selectedBday} cardRef={cardRef} />
            </div>
            <Btn onClick={shareBirthdayCard} style={{ width: '100%', maxWidth: 380, background: 'linear-gradient(135deg, #c4a35a 0%, #d4b96a 100%)' , color: '#0a0a18' }}>
              {isCapturing ? "⏳ Generando Imagen..." : "📤 Descargar para WhatsApp / Instagram"}
            </Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}