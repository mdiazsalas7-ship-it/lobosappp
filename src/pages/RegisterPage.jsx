import React, { useState, useRef, useMemo } from 'react';
import { Avatar, Input, Select, Btn } from '../components/UIComponents';
import { generateId, saveData, uploadFile } from '../utils/helpers';

const CATEGORIAS_BASKET = [
  "Mini Basket (8-12 años)", "U13", "U14", "U15", "U16", 
  "U17", "U18", "U19", "U20", "Adulto"
];

const TODOS_LOS_NUMEROS = ["00", ...Array.from({ length: 100 }, (_, i) => String(i))];

export default function RegisterPage({ athletes, setAthletes, users, setUsers, payments, setPayments }) {
  const [form, setForm] = useState({ name: "", cedula: "", birthDate: "", category: "Mini Basket (8-12 años)", uniformNumber: "", position: "", size: "", photo: "", repName: "", repCedula: "", repPhone: "", repEmail: "", repRelation: "Padre" });
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [inscription, setInscription] = useState({ amount: "", ref: "", exonerado: false });
  const [msg, setMsg] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const fileRef = useRef();

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setForm(f => ({ ...f, photo: URL.createObjectURL(file) }));
  };

  const numerosDisponibles = useMemo(() => {
    const numerosOcupados = athletes
      .filter(a => a.category === form.category && a.status === "activo")
      .map(a => String(a.uniformNumber));
    return TODOS_LOS_NUMEROS.filter(n => !numerosOcupados.includes(n));
  }, [athletes, form.category]);

  const handleSubmit = async () => {
    if (!form.name || !form.birthDate || !form.uniformNumber) { 
      setMsg("Nombre, fecha de nacimiento y número de uniforme son obligatorios"); 
      return; 
    }

    if (!credentials.username || !credentials.password) {
      setMsg("Debes crear un usuario y contraseña para el atleta/representante");
      return;
    }

    if (users.find(u => u.username === credentials.username)) {
      setMsg("Ese nombre de usuario ya existe. Escoge otro.");
      return;
    }

    if (!inscription.exonerado && !inscription.amount) {
      setMsg("Debes ingresar el monto de inscripción o marcar como exonerado");
      return;
    }

    setMsg("⏳ Subiendo imagen y guardando datos...");

    let photoUrl = form.photo;
    if (imageFile) {
      const uploadedUrl = await uploadFile(imageFile, "fotos_atletas");
      if (uploadedUrl) photoUrl = uploadedUrl;
    }

    const athleteId = generateId();
    const newAthlete = { 
      ...form, 
      photo: photoUrl, 
      id: athleteId, 
      status: "activo", 
      exonerado: inscription.exonerado,
      createdAt: new Date().toISOString() 
    };
    const updatedAthletes = [newAthlete, ...athletes];
    setAthletes(updatedAthletes);
    await saveData("lobos-athletes", updatedAthletes);

    // Registrar pago de inscripción si no es exonerado
    if (!inscription.exonerado && inscription.amount) {
      const inscriptionPayment = {
        id: generateId(),
        athleteId: athleteId,
        month: "INSCRIPCION",
        amount: parseFloat(inscription.amount),
        ref: inscription.ref || "Inscripción",
        date: new Date().toISOString(),
        type: "inscripcion"
      };
      const updatedPayments = [...payments, inscriptionPayment];
      setPayments(updatedPayments);
      await saveData("lobos-payments", updatedPayments);
    }

    // Crear cuenta de usuario
    const newUser = {
      id: generateId(),
      username: credentials.username,
      password: credentials.password,
      role: "user",
      athleteId: athleteId
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await saveData("lobos-users", updatedUsers);

    setForm({ name: "", cedula: "", birthDate: "", category: "Mini Basket (8-12 años)", uniformNumber: "", position: "", size: "", photo: "", repName: "", repCedula: "", repPhone: "", repEmail: "", repRelation: "Padre" });
    setCredentials({ username: "", password: "" });
    setInscription({ amount: "", ref: "", exonerado: false });
    setImageFile(null);
    
    setMsg("✅ Atleta registrado exitosamente");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#c4a35a", letterSpacing: 2, marginBottom: 16 }}>Registrar Nuevo Atleta</h2>
      {msg && <div style={{ padding: "10px 16px", borderRadius: 10, background: msg.includes("✅") ? "#0d2818" : msg.includes("⏳") ? "#2a2410" : "#2a1215", color: msg.includes("✅") ? "#34d399" : msg.includes("⏳") ? "#fbbf24" : "#f87171", marginBottom: 14, fontSize: 14, fontWeight: "bold" }}>{msg}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 18px" }}>
        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
          <Avatar src={form.photo} name={form.name || "?"} size={72} />
          <div>
            <Btn variant="ghost" onClick={() => fileRef.current?.click()} style={{ fontSize: 13 }}>📷 Seleccionar Foto</Btn>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} hidden />
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
          onChange={e => setForm(f => ({ ...f, category: e.target.value, uniformNumber: "" }))}
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

        {/* === INSCRIPCIÓN === */}
        <div style={{ gridColumn: "1 / -1" }}>
          <h4 style={{ color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", margin: "18px 0 10px", letterSpacing: 1 }}>💳 Inscripción</h4>
        </div>

        <div style={{ gridColumn: "1 / -1", marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "12px 16px", background: inscription.exonerado ? "#0d2818" : "#111827", borderRadius: 12, border: inscription.exonerado ? "1px solid #34d399" : "1px solid #2a3a50", transition: "all 0.2s" }}
            onClick={() => setInscription(i => ({ ...i, exonerado: !i.exonerado, amount: !i.exonerado ? "" : i.amount }))}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: inscription.exonerado ? "2px solid #34d399" : "2px solid #2a3a50", background: inscription.exonerado ? "#34d399" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
              {inscription.exonerado && <span style={{ color: "#0a0a18", fontSize: 14, fontWeight: 900 }}>✓</span>}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: inscription.exonerado ? "#34d399" : "#e2e8f0", fontSize: 14 }}>Atleta Exonerado</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>Sin costo de inscripción ni mensualidad</div>
            </div>
          </label>
        </div>

        {!inscription.exonerado && (
          <>
            <Input label="Monto Inscripción ($)" type="number" value={inscription.amount} onChange={e => setInscription(i => ({ ...i, amount: e.target.value }))} placeholder="Ej: 100" />
            <Input label="Referencia de Pago" value={inscription.ref} onChange={e => setInscription(i => ({ ...i, ref: e.target.value }))} placeholder="Nro. transferencia" />
          </>
        )}

        {/* === REPRESENTANTE === */}
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

        {/* === ACCESO === */}
        <div style={{ gridColumn: "1 / -1" }}>
          <h4 style={{ color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", margin: "18px 0 10px", letterSpacing: 1 }}>🔐 Acceso a la App</h4>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>El representante usará estas credenciales para entrar a la app y ver pagos.</p>
        </div>
        <Input label="Usuario" value={credentials.username} onChange={e => setCredentials(c => ({ ...c, username: e.target.value }))} placeholder="Ej: jperez" />
        <Input label="Contraseña" value={credentials.password} onChange={e => setCredentials(c => ({ ...c, password: e.target.value }))} placeholder="Mínimo 4 caracteres" />
      </div>

      <div style={{ marginTop: 20 }}>
        <Btn onClick={handleSubmit} disabled={msg.includes("⏳")} style={{ width: "100%", padding: 14, fontSize: 16 }}>
          {inscription.exonerado ? "Registrar Atleta (Exonerado)" : `Registrar Atleta — Inscripción $${inscription.amount || "0"}`}
        </Btn>
      </div>
    </div>
  );
}