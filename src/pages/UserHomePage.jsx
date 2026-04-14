import React, { useState, useRef } from 'react';
import { Avatar, Btn, Modal, Input, StatCard } from '../components/UIComponents';
import { getAge, formatDate, generateId, saveData, uploadFile, MONTHS } from '../utils/helpers';

export default function UserHomePage({ currentUser, athletes, payments, paymentProofs, setPaymentProofs }) {
  const [showUpload, setShowUpload] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState("");
  const [proofAmount, setProofAmount] = useState("");
  const [proofRef, setProofRef] = useState("");
  const [proofMonth, setProofMonth] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  const athlete = athletes.find(a => a.id === currentUser.athleteId);
  if (!athlete) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
      <p>No se encontró tu perfil de atleta.</p>
      <p style={{ fontSize: 13, color: "#64748b" }}>Contacta al entrenador.</p>
    </div>
  );

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const myPayments = payments.filter(p => p.athleteId === athlete.id);
  const myProofs = paymentProofs.filter(p => p.athleteId === athlete.id);
  const isPaidThisMonth = myPayments.some(p => p.month === currentMonth);
  const pendingProofs = myProofs.filter(p => p.status === "pendiente");

  // Generar opciones de meses
  const monthOptions = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthOptions.push({ value: val, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
  }

  const handleProofPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const submitProof = async () => {
    if (!proofFile || !proofAmount || !proofMonth) {
      setMsg("Debes seleccionar mes, monto y foto del comprobante");
      return;
    }

    setIsUploading(true);
    setMsg("⏳ Subiendo comprobante...");

    const proofUrl = await uploadFile(proofFile, "comprobantes_pago");

    const newProof = {
      id: generateId(),
      athleteId: athlete.id,
      athleteName: athlete.name,
      month: proofMonth,
      amount: parseFloat(proofAmount),
      ref: proofRef,
      proofUrl: proofUrl || proofPreview,
      status: "pendiente",
      date: new Date().toISOString(),
      reviewedBy: null,
      reviewDate: null
    };

    const updated = [newProof, ...paymentProofs];
    setPaymentProofs(updated);
    await saveData("lobos-payment-proofs", updated);

    setIsUploading(false);
    setShowUpload(false);
    setProofFile(null);
    setProofPreview("");
    setProofAmount("");
    setProofRef("");
    setProofMonth("");
    setMsg("✅ Comprobante enviado. Esperando aprobación del admin.");
    setTimeout(() => setMsg(""), 4000);
  };

  // Historial de últimos 6 meses
  const last6Months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const paid = myPayments.find(p => p.month === val);
    const proof = myProofs.find(p => p.month === val);
    last6Months.push({ month: val, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, paid, proof });
  }

  return (
    <div>
      {/* PERFIL DEL ATLETA */}
      <div style={{
        background: "#111827", borderRadius: 20, padding: "24px 20px",
        border: "1px solid #2a3a50", marginBottom: 20,
        display: "flex", gap: 16, alignItems: "center"
      }}>
        <Avatar src={athlete.photo} name={athlete.name} size={70} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#c4a35a", letterSpacing: 2, margin: "0 0 4px" }}>
            {athlete.name}
          </h2>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>
            {athlete.category} · Dorsal #{athlete.uniformNumber} · {athlete.position || "Jugador"}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {getAge(athlete.birthDate)} años · Talla: {athlete.size || "N/A"}
          </div>
        </div>
      </div>

      {/* ESTADO FINANCIERO */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <StatCard
          icon={isPaidThisMonth ? "✅" : "⚠️"}
          label="Estado este mes"
          value={isPaidThisMonth ? "Solvente" : "Pendiente"}
          color={isPaidThisMonth ? "#34d399" : "#f87171"}
        />
        <StatCard
          icon="⏳"
          label="Por aprobar"
          value={pendingProofs.length}
          color="#fbbf24"
        />
      </div>

      {/* MENSAJE */}
      {msg && (
        <div style={{
          padding: "10px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 600,
          background: msg.includes("✅") ? "#0d2818" : msg.includes("⏳") ? "#2a2410" : "#2a1215",
          color: msg.includes("✅") ? "#34d399" : msg.includes("⏳") ? "#fbbf24" : "#f87171"
        }}>
          {msg}
        </div>
      )}

      {/* BOTÓN SUBIR COMPROBANTE */}
      <Btn onClick={() => setShowUpload(true)} style={{ width: "100%", padding: 14, fontSize: 15, marginBottom: 24 }}>
        📤 Subir Comprobante de Pago
      </Btn>

      {/* HISTORIAL DE PAGOS */}
      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#c4a35a", letterSpacing: 2, marginBottom: 12 }}>
        Historial de Pagos
      </h3>

      {last6Months.map(m => {
        let statusBg, statusColor, statusText, statusIcon;

        if (m.paid) {
          statusBg = "#0d2818"; statusColor = "#34d399"; statusText = "Pagado"; statusIcon = "✅";
        } else if (m.proof && m.proof.status === "pendiente") {
          statusBg = "#2a2410"; statusColor = "#fbbf24"; statusText = "En revisión"; statusIcon = "⏳";
        } else if (m.proof && m.proof.status === "rechazado") {
          statusBg = "#2a1215"; statusColor = "#f87171"; statusText = "Rechazado"; statusIcon = "❌";
        } else {
          statusBg = "#1e1215"; statusColor = "#94a3b8"; statusText = "No pagado"; statusIcon = "⚠️";
        }

        return (
          <div key={m.month} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#111827", borderRadius: 12, padding: "12px 16px",
            marginBottom: 8, border: "1px solid #1e2d40"
          }}>
            <div>
              <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14 }}>{m.label}</div>
              {m.paid && (
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  ${m.paid.amount} — Ref: {m.paid.ref || "N/A"} — {formatDate(m.paid.date)}
                </div>
              )}
              {m.proof && m.proof.status === "rechazado" && m.proof.rejectReason && (
                <div style={{ fontSize: 11, color: "#f87171" }}>
                  Motivo: {m.proof.rejectReason}
                </div>
              )}
            </div>
            <span style={{
              padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: statusBg, color: statusColor
            }}>
              {statusIcon} {statusText}
            </span>
          </div>
        );
      })}

      {/* MODAL SUBIR COMPROBANTE */}
      <Modal open={showUpload} onClose={() => { setShowUpload(false); setProofFile(null); setProofPreview(""); }} title="Subir Comprobante de Pago">
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: "#c4a35a", marginBottom: 4, textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>Mes a pagar</label>
          <select value={proofMonth} onChange={e => setProofMonth(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #2a3a50", background: "#0f172a", color: "#f1f5f9", fontSize: 15 }}>
            <option value="">-- Seleccionar mes --</option>
            {monthOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <Input label="Monto ($)" type="number" value={proofAmount} onChange={e => setProofAmount(e.target.value)} placeholder="Ej: 50" />
        <Input label="Referencia / Nro. Transacción" value={proofRef} onChange={e => setProofRef(e.target.value)} placeholder="Opcional" />

        {/* Foto del comprobante */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, color: "#c4a35a", marginBottom: 8, textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>Foto del comprobante</label>

          {proofPreview ? (
            <div style={{ position: "relative", marginBottom: 10 }}>
              <img src={proofPreview} alt="Comprobante" style={{ width: "100%", maxHeight: 250, objectFit: "contain", borderRadius: 12, border: "1px solid #2a3a50" }} />
              <button onClick={() => { setProofFile(null); setProofPreview(""); }} style={{
                position: "absolute", top: 8, right: 8,
                background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%",
                width: 28, height: 28, color: "#fff", fontSize: 14, cursor: "pointer"
              }}>✕</button>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()} style={{
              border: "2px dashed #2a3a50", borderRadius: 12, padding: "30px 20px",
              textAlign: "center", cursor: "pointer", color: "#64748b", fontSize: 14
            }}>
              📷 Toca para seleccionar la foto del comprobante
            </div>
          )}
          <input type="file" ref={fileRef} hidden accept="image/*" onChange={handleProofPhoto} />
        </div>

        <Btn onClick={submitProof} disabled={isUploading} style={{ width: "100%", padding: 14, fontSize: 15 }}>
          {isUploading ? "⏳ Enviando..." : "📤 Enviar Comprobante"}
        </Btn>
      </Modal>
    </div>
  );
}