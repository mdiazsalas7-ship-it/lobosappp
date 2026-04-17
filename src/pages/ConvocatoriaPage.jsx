import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Avatar, Btn, Input, Modal, WolfLogo } from '../components/UIComponents';
import { generateId, saveData, formatDate, MONTHS } from '../utils/helpers';

const CATEGORIAS_BASKET = [
  "Mini Basket (8-12 años)", "U13", "U14", "U15", "U16", 
  "U17", "U18", "U19", "U20", "Adulto"
];

export default function ConvocatoriaPage({ athletes, news, setNews }) {
  const [step, setStep] = useState(1);
  const [gameData, setGameData] = useState({
    opponent: "", date: "", time: "", location: "", notes: ""
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterCat, setFilterCat] = useState("Todas");
  const [searchName, setSearchName] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const cardRef = useRef(null);

  const activeAthletes = athletes.filter(a => a.status === "activo");
  
  // Filtro solo para la vista, NO afecta la selección
  const visibleAthletes = activeAthletes.filter(a => {
    if (filterCat !== "Todas" && a.category !== filterCat) return false;
    if (searchName && !a.name.toLowerCase().includes(searchName.toLowerCase())) return false;
    return true;
  });

  const selectedAthletes = athletes.filter(a => selectedIds.includes(a.id));
  const pastConvocatorias = (news || []).filter(n => n.type === "convocatoria");

  // Categorías que tienen jugadores seleccionados
  const selectedCategories = [...new Set(selectedAthletes.map(a => a.category))];

  const togglePlayer = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Seleccionar todos los visibles (se SUMAN a los ya seleccionados)
  const selectAllVisible = () => {
    const visibleIds = visibleAthletes.map(a => a.id);
    setSelectedIds(prev => [...new Set([...prev, ...visibleIds])]);
  };

  // Deseleccionar solo los visibles (mantiene los de otras categorías)
  const deselectVisible = () => {
    const visibleIds = visibleAthletes.map(a => a.id);
    setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
  };

  const deselectAll = () => setSelectedIds([]);

  const goToPreview = () => {
    if (!gameData.opponent || !gameData.date) {
      alert("Debes ingresar al menos el rival y la fecha");
      return;
    }
    if (selectedIds.length === 0) {
      alert("Debes seleccionar al menos un jugador");
      return;
    }
    setStep(3);
  };

  const formatGameDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + 'T12:00:00');
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return `${days[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  const generateWhatsAppText = () => {
    let text = `🏀 *CONVOCATORIA - LOBOS DE RIBAS* 🐺\n\n`;
    text += `📅 ${formatGameDate(gameData.date)}`;
    if (gameData.time) text += ` ⏰ ${gameData.time}`;
    text += `\n`;
    text += `🆚 vs *${gameData.opponent}*\n`;
    if (gameData.location) text += `📍 ${gameData.location}\n`;
    text += `\n👥 *JUGADORES CONVOCADOS (${selectedAthletes.length}):*\n\n`;
    
    // Agrupar por categoría
    selectedCategories.forEach(cat => {
      const playersInCat = selectedAthletes.filter(a => a.category === cat);
      text += `📋 *${cat}:*\n`;
      playersInCat.forEach((a, i) => {
        text += `  ${i + 1}. ${a.name} #${a.uniformNumber || 'S/N'} - ${a.position || 'Jugador'}\n`;
      });
      text += `\n`;
    });

    if (gameData.notes) text += `📝 ${gameData.notes}\n`;
    text += `¡Vamos Lobos! 🐺🔥`;
    return text;
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(generateWhatsAppText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const captureCard = async () => {
    if (!cardRef.current) return;
    setIsCapturing(true);
    try {
      const images = cardRef.current.querySelectorAll("img");
      const originals = [];
      for (const img of images) {
        const src = img.src;
        if (src && !src.startsWith("data:")) {
          originals.push({ img, src });
          try {
            const resp = await fetch(src);
            const blob = await resp.blob();
            const b64 = await new Promise(r => { const rd = new FileReader(); rd.onloadend = () => r(rd.result); rd.readAsDataURL(blob); });
            if (b64) img.src = b64;
          } catch {}
        }
      }
      const canvas = await html2canvas(cardRef.current, { 
        useCORS: true, allowTaint: true, backgroundColor: '#0a0a18', scale: 2 
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Convocatoria_Lobos_vs_${gameData.opponent.replace(/\s+/g, '_')}.png`;
      link.click();
      originals.forEach(({ img, src }) => { img.src = src; });
    } catch (error) {
      console.error("Error:", error);
    }
    setIsCapturing(false);
  };

  const publishAndReset = async () => {
    const newsItem = {
      id: generateId(),
      title: `🏀 Convocatoria vs ${gameData.opponent}`,
      body: generateWhatsAppText().replace(/\*/g, ''),
      date: new Date().toISOString(),
      type: "convocatoria",
      gameData: { ...gameData },
      players: selectedIds
    };
    const updatedNews = [newsItem, ...(news || [])];
    setNews(updatedNews);
    await saveData("lobos-news", updatedNews);
    setStep(1);
    setGameData({ opponent: "", date: "", time: "", location: "", notes: "" });
    setSelectedIds([]);
    alert("✅ Convocatoria publicada en Noticias");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#c4a35a", letterSpacing: 2, margin: 0 }}>
          {step === 1 ? "Nueva Convocatoria" : step === 2 ? "Seleccionar Jugadores" : "Vista Previa"}
        </h2>
        {pastConvocatorias.length > 0 && step === 1 && (
          <Btn variant="ghost" onClick={() => setShowHistory(!showHistory)} style={{ fontSize: 12 }}>
            📋 Historial ({pastConvocatorias.length})
          </Btn>
        )}
      </div>

      {/* === PASO 1: DATOS DEL JUEGO === */}
      {step === 1 && (
        <div>
          <div style={{ background: "#111827", borderRadius: 16, padding: 20, border: "1px solid #2a3a50", marginBottom: 20 }}>
            <h3 style={{ color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, margin: "0 0 14px", letterSpacing: 1 }}>Datos del Juego</h3>
            
            <Input label="Rival / Oponente" value={gameData.opponent} onChange={e => setGameData(d => ({ ...d, opponent: e.target.value }))} placeholder="Ej: Leones de Caracas" />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <Input label="Fecha del Juego" type="date" value={gameData.date} onChange={e => setGameData(d => ({ ...d, date: e.target.value }))} />
              <Input label="Hora" type="time" value={gameData.time} onChange={e => setGameData(d => ({ ...d, time: e.target.value }))} />
            </div>

            <Input label="Lugar / Cancha" value={gameData.location} onChange={e => setGameData(d => ({ ...d, location: e.target.value }))} placeholder="Ej: Cancha Techada de Ribas" />
            <Input label="Notas (opcional)" value={gameData.notes} onChange={e => setGameData(d => ({ ...d, notes: e.target.value }))} placeholder="Ej: Llevar uniforme azul, llegar 1h antes" />
          </div>

          <Btn onClick={() => {
            if (!gameData.opponent || !gameData.date) { alert("Ingresa al menos rival y fecha"); return; }
            setStep(2);
          }} style={{ width: "100%", padding: 14, fontSize: 16 }}>
            Siguiente → Seleccionar Jugadores
          </Btn>

          {showHistory && pastConvocatorias.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ color: "#94a3b8", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, margin: "0 0 12px" }}>Convocatorias Anteriores</h3>
              {pastConvocatorias.slice(0, 5).map(c => (
                <div key={c.id} style={{ background: "#111827", borderRadius: 12, padding: "12px 16px", marginBottom: 8, border: "1px solid #1e2d40" }}>
                  <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{formatDate(c.date)} · {c.players?.length || 0} jugadores</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* === PASO 2: SELECCIONAR JUGADORES === */}
      {step === 2 && (
        <div>
          {/* Info del juego */}
          <div style={{ background: "#111827", borderRadius: 12, padding: "12px 16px", marginBottom: 14, border: "1px solid #2a3a50", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, color: "#c4a35a", fontSize: 15 }}>vs {gameData.opponent}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{formatGameDate(gameData.date)} {gameData.time && `· ${gameData.time}`}</div>
            </div>
            <Btn variant="ghost" onClick={() => setStep(1)} style={{ fontSize: 11, padding: "6px 10px" }}>✏️</Btn>
          </div>

          {/* Resumen de seleccionados por categoría */}
          {selectedIds.length > 0 && (
            <div style={{ background: "rgba(196, 163, 90, 0.08)", borderRadius: 12, padding: "10px 14px", marginBottom: 14, border: "1px solid rgba(196, 163, 90, 0.2)" }}>
              <div style={{ fontSize: 12, color: "#c4a35a", fontWeight: 700, marginBottom: 6 }}>
                ✅ {selectedIds.length} convocados:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {selectedCategories.map(cat => {
                  const count = selectedAthletes.filter(a => a.category === cat).length;
                  return (
                    <span key={cat} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#1e2d40", color: "#94a3b8", fontWeight: 600 }}>
                      {cat}: {count}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtros — solo para buscar, no restringen selección */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <input placeholder="Buscar nombre..." value={searchName} onChange={e => setSearchName(e.target.value)} style={{ flex: 1, minWidth: 140, padding: "8px 12px", borderRadius: 10, border: "1px solid #2a3a50", background: "#0f172a", color: "#f1f5f9", fontSize: 13, outline: "none" }} />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #2a3a50", background: "#0f172a", color: "#f1f5f9", fontSize: 13 }}>
              <option value="Todas">Todas las categorías</option>
              {CATEGORIAS_BASKET.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Botones rápidos */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#94a3b8", flex: 1 }}>
              <span style={{ color: "#c4a35a", fontWeight: 700, fontSize: 18 }}>{selectedIds.length}</span>
              <span style={{ color: "#64748b" }}> total · </span>
              <span style={{ color: "#60a5fa", fontSize: 12 }}>viendo {visibleAthletes.length}</span>
            </span>
            <Btn variant="ghost" onClick={selectAllVisible} style={{ fontSize: 11, padding: "5px 10px" }}>
              + Visibles
            </Btn>
            <Btn variant="ghost" onClick={deselectVisible} style={{ fontSize: 11, padding: "5px 10px" }}>
              - Visibles
            </Btn>
            {selectedIds.length > 0 && (
              <Btn variant="ghost" onClick={deselectAll} style={{ fontSize: 11, padding: "5px 10px", color: "#f87171" }}>
                Limpiar
              </Btn>
            )}
          </div>

          {/* Grid de jugadores */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 20 }}>
            {visibleAthletes.map(a => {
              const isSelected = selectedIds.includes(a.id);
              return (
                <div key={a.id} onClick={() => togglePlayer(a.id)} style={{
                  background: isSelected ? "rgba(196, 163, 90, 0.1)" : "#111827",
                  border: isSelected ? "2px solid #c4a35a" : "1px solid #2a3a50",
                  borderRadius: 14, padding: "12px 10px",
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  position: "relative"
                }}>
                  {isSelected && (
                    <div style={{
                      position: "absolute", top: 6, right: 6,
                      width: 22, height: 22, borderRadius: "50%",
                      background: "#c4a35a", display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <span style={{ color: "#0a0a18", fontSize: 13, fontWeight: 900 }}>✓</span>
                    </div>
                  )}
                  <Avatar src={a.photo} name={a.name} size={48} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, color: isSelected ? "#c4a35a" : "#e2e8f0", fontSize: 12, lineHeight: 1.2 }}>{a.name}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>#{a.uniformNumber} · {a.position || "—"}</div>
                    <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>{a.category}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleAthletes.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px", color: "#64748b", fontSize: 14 }}>
              No hay atletas con ese filtro
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>← Atrás</Btn>
            <Btn onClick={goToPreview} style={{ flex: 2, padding: 14, fontSize: 15 }}>
              Ver Convocatoria ({selectedIds.length}) →
            </Btn>
          </div>
        </div>
      )}

      {/* === PASO 3: PREVIEW Y COMPARTIR === */}
      {step === 3 && (
        <div>
          <div ref={cardRef} style={{
            background: "#0a0a18", borderRadius: 20, overflow: "hidden",
            border: "3px solid #c4a35a", maxWidth: 420, margin: "0 auto 20px"
          }}>
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
              padding: "20px", textAlign: "center",
              borderBottom: "2px solid #c4a35a"
            }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <WolfLogo size={36} />
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#c4a35a", letterSpacing: 3 }}>LOBOS DE RIBAS</span>
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#fff", letterSpacing: 2 }}>
                CONVOCATORIA
              </div>
            </div>

            {/* Info del juego */}
            <div style={{ padding: "16px 20px", background: "#111827" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>🆚</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#f1f5f9", letterSpacing: 1 }}>vs {gameData.opponent}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, color: "#94a3b8" }}>
                <span>📅 {formatGameDate(gameData.date)}</span>
                {gameData.time && <span>⏰ {gameData.time}</span>}
              </div>
              {gameData.location && (
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>📍 {gameData.location}</div>
              )}
            </div>

            {/* Lista agrupada por categoría */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid #2a3a50" }}>
              <div style={{ fontSize: 11, color: "#c4a35a", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
                Jugadores Convocados ({selectedAthletes.length})
              </div>

              {selectedCategories.map(cat => {
                const playersInCat = selectedAthletes.filter(a => a.category === cat);
                return (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: "#60a5fa", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                      {cat} ({playersInCat.length})
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                      {playersInCat.map((a, i) => (
                        <div key={a.id} style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "5px 8px", borderRadius: 8,
                          background: i % 2 === 0 ? "rgba(196, 163, 90, 0.04)" : "transparent"
                        }}>
                          <Avatar src={a.photo} name={a.name} size={26} />
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.2 }}>{a.name}</div>
                            <div style={{ fontSize: 9, color: "#64748b" }}>#{a.uniformNumber} · {a.position || "—"}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {gameData.notes && (
              <div style={{ padding: "10px 20px", borderTop: "1px solid #1e2d40", fontSize: 12, color: "#94a3b8" }}>
                📝 {gameData.notes}
              </div>
            )}

            {/* Footer */}
            <div style={{
              padding: "10px 20px", borderTop: "1px solid rgba(196, 163, 90, 0.2)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "#0a0a18"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <WolfLogo size={16} />
                <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: 1 }}>ESCUELA DE BALONCESTO</span>
              </div>
              <span style={{ fontSize: 10, color: "#64748b" }}>🐺 #SomosLobos</span>
            </div>
          </div>

          {/* Botones */}
          <div style={{ maxWidth: 420, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
            <Btn onClick={shareWhatsApp} style={{ width: "100%", padding: 14, fontSize: 15, background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)" }}>
              📲 Compartir por WhatsApp
            </Btn>
            <Btn onClick={captureCard} style={{ width: "100%", padding: 14, fontSize: 14, background: "#1e3a5f" }}>
              {isCapturing ? "⏳ Generando..." : "📸 Descargar Imagen"}
            </Btn>
            <Btn onClick={publishAndReset} style={{ width: "100%", padding: 14, fontSize: 14, background: "linear-gradient(135deg, #c4a35a 0%, #d4b96a 100%)", color: "#0a0a18" }}>
              📰 Publicar en Noticias y Finalizar
            </Btn>
            <Btn variant="ghost" onClick={() => setStep(2)} style={{ width: "100%" }}>
              ← Editar Selección
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}