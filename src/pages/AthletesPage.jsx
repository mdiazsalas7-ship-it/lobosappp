import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Avatar, Modal, Btn, LOGO_SRC, WolfLogo, Input, Select } from '../components/UIComponents';
import BirthdayCard from '../components/BirthdayCard';
import { getAge, formatDate, saveData, getDaysUntilBirthday, uploadFile } from '../utils/helpers';

const CATEGORIAS_BASKET = [
  "Mini Basket (8-12 años)", "U13", "U14", "U15", "U16", 
  "U17", "U18", "U19", "U20", "Adulto"
];

// Helper para los colores de los estatus
const getStatusStyles = (status) => {
  if (status === 'activo') return { bg: '#1a3a2a', text: '#44cc88', label: 'Activo' };
  if (status === 'inactivo') return { bg: '#3a1a1a', text: '#ee5566', label: 'Inactivo' };
  if (status === 'congelado') return { bg: '#1a2a4a', text: '#66ccff', label: 'Congelado' };
  return { bg: '#222240', text: '#8888aa', label: status || 'Desconocido' };
};

export default function AthletesPage({ athletes, setAthletes, payments, isAdmin = false }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCategory, setFilterCategory] = useState("todas");
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Estados para la Edición
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [editImageFile, setEditImageFile] = useState(null);
  
  const cardRef = useRef(null);
  const fileRef = useRef(null);

  const filtered = athletes.filter(a => {
    if (filterStatus !== "todos" && a.status !== filterStatus) return false;
    if (filterCategory !== "todas" && a.category !== filterCategory) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const isBirthday = selected ? getDaysUntilBirthday(selected.birthDate) === 0 : false;
  const age = selected ? getAge(selected.birthDate) + (isBirthday ? 0 : 0) : 0;

  // --- FUNCIONES DE CUMPLEAÑOS ---
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
      link.download = `Cumpleanos_Lobos_${selected.name.replace(/\s+/g, '_')}.png`;
      link.click();
    } catch (error) {
      console.error("Error al generar la imagen:", error);
    }
    setIsCapturing(false);
  };

  // --- FUNCIONES DE EDICIÓN ---
  const startEditing = () => {
    setEditForm(selected);
    setEditImageFile(null);
    setIsEditing(true);
  };

  const handlePhotoEdit = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    setEditForm(f => ({ ...f, photo: URL.createObjectURL(file) }));
  };

  const saveEdits = async () => {
    setIsSaving(true);
    let photoUrl = editForm.photo;

    // Si se subió una foto nueva, la mandamos a Firebase Storage
    if (editImageFile) {
      const uploadedUrl = await uploadFile(editImageFile, "fotos_atletas");
      if (uploadedUrl) photoUrl = uploadedUrl;
    }

    const updatedAthlete = { ...editForm, photo: photoUrl };
    const updatedList = athletes.map(a => a.id === selected.id ? updatedAthlete : a);

    setAthletes(updatedList);
    await saveData("lobos-athletes", updatedList);

    setSelected(updatedAthlete); // Volvemos a mostrar la barajita con los datos nuevos
    setIsEditing(false);
    setIsSaving(false);
  };

  return (
    <div>
      <style>{`
        @keyframes cardShine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes pulseGold {
          0% { box-shadow: 0 0 0 0 rgba(196, 163, 90, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(196, 163, 90, 0); }
          100% { box-shadow: 0 0 0 0 rgba(196, 163, 90, 0); }
        }
        .edit-scroll::-webkit-scrollbar { width: 6px; }
        .edit-scroll::-webkit-scrollbar-track { background: #0d0d1a; }
        .edit-scroll::-webkit-scrollbar-thumb { background: #333355; border-radius: 10px; }
      `}</style>

      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#c4a35a", letterSpacing: 2, marginBottom: 16 }}>Directorio de Atletas</h2>
      
      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180, padding: "10px 14px", borderRadius: 10, border: "1px solid #333355", background: "#0d0d1a", color: "#eee", fontSize: 14, outline: "none" }} />
        
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #333355", background: "#0d0d1a", color: "#eee", fontSize: 14 }}>
          <option value="todas">Todas las Categorías</option>
          {CATEGORIAS_BASKET.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        {/* Filtro actualizado con Congelado */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #333355", background: "#0d0d1a", color: "#eee", fontSize: 14 }}>
          <option value="todos">Todos los Estados</option>
          <option value="activo">Activos</option>
          <option value="congelado">Congelados</option>
          <option value="inactivo">Inactivos (Bajas)</option>
        </select>
      </div>

      {/* Grid de Atletas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {filtered.map(a => {
          const isHoy = getDaysUntilBirthday(a.birthDate) === 0;
          const statusStyle = getStatusStyles(a.status);
          
          return (
            <div key={a.id} onClick={() => { setSelected(a); setIsEditing(false); }} style={{ background: "#111122", borderRadius: 14, padding: 16, cursor: "pointer", border: isHoy ? "1px solid #c4a35a" : "1px solid #222240", transition: "all 0.2s", position: "relative", overflow: "hidden", animation: isHoy ? "pulseGold 2s infinite" : "none" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#c4a35a"}
              onMouseLeave={e => e.currentTarget.style.borderColor = isHoy ? "#c4a35a" : "#222240"}>
              
              <div style={{ position: "absolute", right: -10, bottom: -20, fontSize: 80, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif", color: "rgba(196, 163, 90, 0.05)", zIndex: 0, pointerEvents: "none" }}>
                {a.uniformNumber}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
                <Avatar src={a.photo} name={a.name} size={46} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#eee" }}>{a.name} {isHoy && "🎉"}</div>
                  <div style={{ fontSize: 12, color: "#8888aa" }}>{a.category} · {getAge(a.birthDate)} años</div>
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: statusStyle.bg, color: statusStyle.text, fontWeight: 600, marginRight: 6 }}>{statusStyle.label}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "#1a1a3a", color: "#6699ff", fontWeight: 600 }}>Dorsal #{a.uniformNumber || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Principal (Barajita o Formulario de Edición) */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setIsEditing(false); }} title={isEditing ? "Editar Registro" : ""}>
        {selected && !isEditing && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {isBirthday ? (
              /* === BARAJITA DE CUMPLEAÑOS === */
              <>
                <div style={{ marginBottom: 20, width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <BirthdayCard athlete={selected} cardRef={cardRef} />
                </div>
                <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 380 }}>
                  <Btn onClick={shareBirthdayCard} style={{ flex: 1, background: 'linear-gradient(135deg, #c4a35a 0%, #d4b96a 100%)', color: '#0a0a18', fontSize: 13 }}>
                    {isCapturing ? "⏳ Generando..." : "🎉 Compartir Cumpleaños"}
                  </Btn>
                  {isAdmin && (
                    <Btn style={{ flex: 1, background: '#1e2d40', color: '#eee', fontSize: 13 }} onClick={startEditing}>
                      ✏️ Editar
                    </Btn>
                  )}
                </div>
              </>
            ) : (
              /* === BARAJITA NORMAL (sin cumpleaños) === */
              <>
                <div ref={cardRef} style={{ width: "100%", maxWidth: 380, borderRadius: 20, overflow: 'hidden', border: `3px solid #c4a35a`, background: '#0d0d1a', boxShadow: '0 20px 60px rgba(0,0,0,.6)', position: 'relative', marginBottom: 20 }}>
                  <div style={{ position: 'relative', height: 360, background: selected.photo ? `url(${selected.photo}) center 15% / cover no-repeat` : `linear-gradient(135deg, #1a1a2e, #0d0d1a)`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.95) 100%)', zIndex: 0 }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,.08) 45%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.08) 55%,transparent 60%)', backgroundSize: '200% 100%', animation: 'cardShine 4s ease-in-out infinite', pointerEvents: 'none', zIndex: 1 }} />

                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: 20, border: '1px solid #c4a35a' }}>
                        <WolfLogo size={20} />
                        <span style={{ fontSize: 11, color: '#c4a35a', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>{selected.category}</span>
                      </div>
                      <div style={{ fontSize: 58, fontWeight: 900, color: '#fff', lineHeight: 0.8, textShadow: '0 4px 12px rgba(0,0,0,0.9)', fontStyle: 'italic', fontFamily: "'Bebas Neue', sans-serif" }}>#{selected.uniformNumber || '--'}</div>
                    </div>

                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 10, textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>{selected.name}</h2>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ padding: '4px 12px', borderRadius: 20, background: '#c4a35a', fontSize: 12, fontWeight: 800, color: '#0d0d1a' }}>{selected.position || 'Jugador'}</span>
                        <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,.15)', fontSize: 12, fontWeight: 800, color: '#fff' }}>{age} Años</span>
                        <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,.15)', fontSize: 12, fontWeight: 800, color: '#fff' }}>Talla {selected.size || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px', background: '#111827', borderTop: '1px solid #2a3a50' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <h4 style={{ color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", margin: 0, fontSize: 18, letterSpacing: 1 }}>Contacto de Emergencia</h4>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: getStatusStyles(selected.status).bg, color: getStatusStyles(selected.status).text, fontWeight: 700 }}>
                        ESTATUS: {getStatusStyles(selected.status).label.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Representante</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{selected.repName || "N/A"} ({selected.repRelation || "?"})</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Teléfono</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#34d399' }}>{selected.repPhone || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 380 }}>
                    <Btn style={{ flex: 1, background: '#1e2d40', color: '#eee', fontSize: 13 }} onClick={startEditing}>
                      ✏️ Editar Datos
                    </Btn>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* --- FORMULARIO DE EDICIÓN --- */}
        {selected && isEditing && (
          <div className="edit-scroll" style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: 10 }}>
            {isSaving && <div style={{ padding: 12, background: "#2a2a1a", color: "#ffcc00", borderRadius: 8, marginBottom: 14, fontWeight: "bold", textAlign: "center" }}>⏳ Guardando cambios en la nube...</div>}
            
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
              <Avatar src={editForm.photo} name={editForm.name} size={64} />
              <div>
                <Btn variant="ghost" onClick={() => fileRef.current?.click()} style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #333355" }}>📷 Cambiar Foto</Btn>
                <input type="file" ref={fileRef} hidden accept="image/*" onChange={handlePhotoEdit} />
              </div>
            </div>

            {/* SELECCIÓN DE ESTATUS */}
            <div style={{ padding: 12, background: "#1a1a2e", borderRadius: 10, border: "1px solid #c4a35a", marginBottom: 14 }}>
              <Select label="Estatus del Atleta" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} options={[
                { value: "activo", label: "✅ Activo (Entrenando y Solvente)" },
                { value: "congelado", label: "❄️ Congelado (Pausa temporal / Lesión)" },
                { value: "inactivo", label: "❌ Inactivo (Retirado o Baja)" }
              ]} />
            </div>

            <Input label="Nombre Completo" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
            <Input label="Cédula" value={editForm.cedula} onChange={e => setEditForm({...editForm, cedula: e.target.value})} />
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 10px" }}>
              <Input label="Fecha Nacimiento" type="date" value={editForm.birthDate} onChange={e => setEditForm({...editForm, birthDate: e.target.value})} />
              <Select label="Categoría" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} options={CATEGORIAS_BASKET.map(c => ({value: c, label: c}))} />
              <Input label="Dorsal (#)" type="number" value={editForm.uniformNumber} onChange={e => setEditForm({...editForm, uniformNumber: e.target.value})} />
              <Input label="Posición" value={editForm.position} onChange={e => setEditForm({...editForm, position: e.target.value})} />
              <Input label="Talla" value={editForm.size} onChange={e => setEditForm({...editForm, size: e.target.value})} style={{ gridColumn: "1 / -1" }} />
            </div>

            <h4 style={{ color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", margin: "16px 0 10px", fontSize: 18, letterSpacing: 1 }}>Datos del Representante</h4>
            <Input label="Nombre Representante" value={editForm.repName} onChange={e => setEditForm({...editForm, repName: e.target.value})} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 10px" }}>
              <Input label="Cédula" value={editForm.repCedula} onChange={e => setEditForm({...editForm, repCedula: e.target.value})} />
              <Input label="Teléfono" value={editForm.repPhone} onChange={e => setEditForm({...editForm, repPhone: e.target.value})} />
              <Select label="Parentesco" value={editForm.repRelation} onChange={e => setEditForm({...editForm, repRelation: e.target.value})} options={[
                { value: "Padre", label: "Padre" }, { value: "Madre", label: "Madre" }, { value: "Tío/a", label: "Tío/a" }, { value: "Abuelo/a", label: "Abuelo/a" }, { value: "Otro", label: "Otro" }
              ]} style={{ gridColumn: "1 / -1" }} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Btn onClick={saveEdits} disabled={isSaving} style={{ flex: 2 }}>{isSaving ? "Guardando..." : "💾 Guardar Cambios"}</Btn>
              <Btn variant="danger" onClick={() => setIsEditing(false)} disabled={isSaving} style={{ flex: 1 }}>Cancelar</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}