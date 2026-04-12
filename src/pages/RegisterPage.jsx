import React, { useState, useRef, useMemo } from 'react';
import { Avatar, Input, Select, Btn } from '../components/UIComponents';
import { generateId, saveData, uploadFile } from '../utils/helpers';

const CATEGORIAS_BASKET = [
  "Mini Basket (8-12 años)", "U13", "U14", "U15", "U16", 
  "U17", "U18", "U19", "U20", "Adulto"
];

// Generamos los números del 0 al 99, agregando el clásico "00" del basket
const TODOS_LOS_NUMEROS = ["00", ...Array.from({ length: 100 }, (_, i) => String(i))];

export default function RegisterPage({ athletes, setAthletes }) {
  const [form, setForm] = useState({ name: "", cedula: "", birthDate: "", category: "Mini Basket (8-12 años)", uniformNumber: "", position: "", size: "", photo: "", repName: "", repCedula: "", repPhone: "", repEmail: "", repRelation: "Padre" });
  const [msg, setMsg] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const fileRef = useRef();

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setForm(f => ({ ...f, photo: URL.createObjectURL(file) }));
  };

  // Lógica brillante: Filtramos los números para que solo salgan los disponibles en esa categoría
  const numerosDisponibles = useMemo(() => {
    // Buscamos qué números ya están usados por atletas activos en la categoría seleccionada
    const numerosOcupados = athletes
      .filter(a => a.category === form.category && a.status === "activo")
      .map(a => String(a.uniformNumber));

    // Devolvemos solo los que NO están ocupados
    return TODOS_LOS_NUMEROS.filter(n => !numerosOcupados.includes(n));
  }, [athletes, form.category]);

  const handleSubmit = async () => {
    if (!form.name || !form.birthDate || !form.uniformNumber) { 
      setMsg("Nombre, fecha de nacimiento y número de uniforme son obligatorios"); 
      return; 
    }

    setMsg("⏳ Subiendo imagen y guardando datos...");

    let photoUrl = form.photo;
    if (imageFile) {
      const uploadedUrl = await uploadFile(imageFile, "fotos_atletas");
      if (uploadedUrl) {
        photoUrl = uploadedUrl;
      }
    }

    const newAthlete = { ...form, photo: photoUrl, id: generateId(), status: "activo", createdAt: new Date().toISOString() };
    const updated = [newAthlete, ...athletes];
    
    setAthletes(updated);
    await saveData("lobos-athletes", updated);

    setForm({ name: "", cedula: "", birthDate: "", category: "Mini Basket (8-12 años)", uniformNumber: "", position: "", size: "", photo: "", repName: "", repCedula: "", repPhone: "", repEmail: "", repRelation: "Padre" });
    setImageFile(null);
    
    setMsg("✅ Atleta registrado exitosamente");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#c4a35a", letterSpacing: 2, marginBottom: 16 }}>Registrar Nuevo Atleta</h2>
      {msg && <div style={{ padding: "10px 16px", borderRadius: 10, background: msg.includes("✅") ? "#1a3a2a" : msg.includes("⏳") ? "#2a2a1a" : "#3a1a1a", color: msg.includes("✅") ? "#44cc88" : msg.includes("⏳") ? "#ffcc00" : "#ee5566", marginBottom: 14, fontSize: 14, fontWeight: "bold" }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
          <Avatar src={form.photo} name={form.name || "?"} size={72} />
          <div>
            <Btn variant="ghost" onClick={() => fileRef.current?.click()} style={{ fontSize: 13 }}>📷 Seleccionar Foto</Btn>
            <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handlePhoto} hidden />
          </div>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <h4 style={{ color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", margin: "8px 0 10px", letterSpacing: 1 }}>Datos del Atleta</h4>
        </div>
        <Input label="Nombre Completo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <Input label="Cédula / Doc. Identidad" value={form.cedula} onChange={e => setForm(f => ({ ...f, cedula: e.target.value }))} />
        <Input label="Fecha de Nacimiento" type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
        
        <Select 
          label="Categoría" 
          value={form.category} 
          onChange={e => setForm(f => ({ ...f, category: e.target.value, uniformNumber: "" }))} // Resetea el número si cambia de categoría
          options={CATEGORIAS_BASKET.map(c => ({ value: c, label: c }))} 
        />
        
        <Select 
          label="Número de Uniforme (Disponibles)" 
          value={form.uniformNumber} 
          onChange={e => setForm(f => ({ ...f, uniformNumber: e.target.value }))} 
          options={[
            { value: "", label: "-- Seleccionar --" },
            ...numerosDisponibles.map(n => ({ value: n, label: `# ${n}` }))
          ]} 
        />

        <Input label="Posición" placeholder="Ej: Base, Alero, Pivot" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
        <Input label="Talla de Uniforme" placeholder="Ej: S, M, L" value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} />

        <div style={{ gridColumn: "1 / -1" }}>
          <h4 style={{ color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", margin: "18px 0 10px", letterSpacing: 1 }}>Datos del Representante</h4>
        </div>
        <Input label="Nombre del Representante" value={form.repName} onChange={e => setForm(f => ({ ...f, repName: e.target.value }))} />
        <Input label="Cédula Representante" value={form.repCedula} onChange={e => setForm(f => ({ ...f, repCedula: e.target.value }))} />
        <Input label="Teléfono" value={form.repPhone} onChange={e => setForm(f => ({ ...f, repPhone: e.target.value }))} />
        <Input label="Email" type="email" value={form.repEmail} onChange={e => setForm(f => ({ ...f, repEmail: e.target.value }))} />
        <Select label="Parentesco" value={form.repRelation} onChange={e => setForm(f => ({ ...f, repRelation: e.target.value }))} options={[
          { value: "Padre", label: "Padre" }, { value: "Madre", label: "Madre" }, { value: "Tío/a", label: "Tío/a" },
          { value: "Abuelo/a", label: "Abuelo/a" }, { value: "Otro", label: "Otro" }
        ]} />
      </div>

      <div style={{ marginTop: 20 }}>
        <Btn onClick={handleSubmit} disabled={msg.includes("⏳")}>Registrar Atleta</Btn>
      </div>
    </div>
  );
}