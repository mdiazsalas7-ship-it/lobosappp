import React, { useState } from 'react';
import { Select, StatCard, Avatar, Btn, Modal, Input } from '../components/UIComponents';
import { generateId, saveData, formatDate, MONTHS } from '../utils/helpers';

export default function AdminPage({ athletes, payments, setPayments, paymentProofs, setPaymentProofs, users, setUsers }) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const [selMonth, setSelMonth] = useState(currentMonth);
  const [showPay, setShowPay] = useState(null);
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [viewProof, setViewProof] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeSection, setActiveSection] = useState("pagos");
  
  // User management state
  const [showCreateUser, setShowCreateUser] = useState(null);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userMsg, setUserMsg] = useState(""); // "pagos" | "comprobantes"

  const activeAthletes = athletes.filter(a => a.status === "activo");
  const getPaymentForMonth = (athleteId, month) => payments.find(p => p.athleteId === athleteId && p.month === month);

  const morosos = activeAthletes.filter(a => !getPaymentForMonth(a.id, selMonth));
  const solventes = activeAthletes.filter(a => getPaymentForMonth(a.id, selMonth));

  const pendingProofs = (paymentProofs || []).filter(p => p.status === "pendiente");

  const registerPayment = () => {
    if (!showPay || !amount) return;
    const newP = { id: generateId(), athleteId: showPay.id, month: selMonth, amount: parseFloat(amount), ref, date: new Date().toISOString() };
    const updated = [...payments, newP];
    setPayments(updated);
    saveData("lobos-payments", updated);
    setShowPay(null);
    setAmount("");
    setRef("");
  };

  const approveProof = (proof) => {
    // 1. Registrar el pago
    const newPayment = {
      id: generateId(),
      athleteId: proof.athleteId,
      month: proof.month,
      amount: proof.amount,
      ref: proof.ref || "Comprobante aprobado",
      date: new Date().toISOString()
    };
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    saveData("lobos-payments", updatedPayments);

    // 2. Marcar comprobante como aprobado
    const updatedProofs = paymentProofs.map(p =>
      p.id === proof.id ? { ...p, status: "aprobado", reviewDate: new Date().toISOString() } : p
    );
    setPaymentProofs(updatedProofs);
    saveData("lobos-payment-proofs", updatedProofs);
    setViewProof(null);
  };

  const rejectProof = (proof) => {
    const updatedProofs = paymentProofs.map(p =>
      p.id === proof.id ? { ...p, status: "rechazado", rejectReason, reviewDate: new Date().toISOString() } : p
    );
    setPaymentProofs(updatedProofs);
    saveData("lobos-payment-proofs", updatedProofs);
    setViewProof(null);
    setRejectReason("");
  };

  const monthOptions = [];
  for (let i = -3; i <= 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    monthOptions.push({ value: val, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
  }

  const totalCollected = payments.filter(p => p.month === selMonth).reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#c4a35a", letterSpacing: 2, marginBottom: 16 }}>Administrativo</h2>

      {/* TABS: Pagos | Comprobantes */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={() => setActiveSection("pagos")} style={{
          flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
          background: activeSection === "pagos" ? "#c4a35a" : "#1e2d40",
          color: activeSection === "pagos" ? "#0a0a18" : "#94a3b8"
        }}>
          💰 Pagos
        </button>
        <button onClick={() => setActiveSection("comprobantes")} style={{
          flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
          background: activeSection === "comprobantes" ? "#c4a35a" : "#1e2d40",
          color: activeSection === "comprobantes" ? "#0a0a18" : "#94a3b8",
          position: "relative"
        }}>
          📋 Comprobantes
          {pendingProofs.length > 0 && (
            <span style={{
              position: "absolute", top: -6, right: -6,
              background: "#f87171", color: "#fff", fontSize: 10, fontWeight: 900,
              width: 20, height: 20, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {pendingProofs.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveSection("usuarios")} style={{
          flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
          background: activeSection === "usuarios" ? "#c4a35a" : "#1e2d40",
          color: activeSection === "usuarios" ? "#0a0a18" : "#94a3b8"
        }}>
          👥 Usuarios
        </button>
      </div>

      {/* === SECCIÓN PAGOS === */}
      {activeSection === "pagos" && (
        <>
          <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <Select label="Mes" value={selMonth} onChange={e => setSelMonth(e.target.value)} options={monthOptions} />
            <StatCard icon="💰" label="Recaudado" value={`$${totalCollected.toLocaleString()}`} color="#34d399" />
            <StatCard icon="⚠️" label="Morosos" value={morosos.length} color="#f87171" />
            <StatCard icon="✅" label="Solventes" value={solventes.length} color="#34d399" />
          </div>

          <h3 style={{ color: "#f87171", fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, margin: "20px 0 10px", letterSpacing: 1 }}>⚠️ Morosos — {monthOptions.find(o => o.value === selMonth)?.label}</h3>
          {morosos.length === 0 ? <div style={{ color: "#34d399", fontSize: 14, padding: 12 }}>¡Todos al día! 🎉</div> : (
            <div style={{ display: "grid", gap: 8 }}>
              {morosos.map(a => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#1a1018", borderRadius: 12, padding: "10px 14px", border: "1px solid #331122" }}>
                  <Avatar src={a.photo} name={a.name} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{a.category} · Tel: {a.repPhone || "N/A"}</div>
                  </div>
                  <Btn onClick={() => { setShowPay(a); setAmount(""); setRef(""); }} style={{ fontSize: 12, padding: "6px 14px" }}>Registrar Pago</Btn>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ color: "#34d399", fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, margin: "24px 0 10px", letterSpacing: 1 }}>✅ Solventes</h3>
          <div style={{ display: "grid", gap: 6 }}>
            {solventes.map(a => {
              const p = getPaymentForMonth(a.id, selMonth);
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#0d1a18", borderRadius: 12, padding: "8px 14px", border: "1px solid #113322" }}>
                  <Avatar src={a.photo} name={a.name} size={34} />
                  <div style={{ flex: 1, fontSize: 14, color: "#e2e8f0" }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "#34d399" }}>${p?.amount} — {formatDate(p?.date)}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* === SECCIÓN COMPROBANTES === */}
      {activeSection === "comprobantes" && (
        <>
          <h3 style={{ color: "#fbbf24", fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, margin: "0 0 14px", letterSpacing: 1 }}>⏳ Comprobantes Pendientes ({pendingProofs.length})</h3>

          {pendingProofs.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px", color: "#64748b", background: "#111827", borderRadius: 16, border: "1px dashed #2a3a50" }}>
              No hay comprobantes por revisar
            </div>
          )}

          {pendingProofs.map(proof => (
            <div key={proof.id} onClick={() => { setViewProof(proof); setRejectReason(""); }} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "#111827", borderRadius: 12, padding: "12px 16px",
              marginBottom: 8, border: "1px solid #2a3a50", cursor: "pointer"
            }}>
              {proof.proofUrl && (
                <img src={proof.proofUrl} style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", border: "1px solid #2a3a50" }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14 }}>{proof.athleteName}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {monthOptions.find(o => o.value === proof.month)?.label || proof.month} · ${proof.amount} · Ref: {proof.ref || "N/A"}
                </div>
                <div style={{ fontSize: 11, color: "#475569" }}>{formatDate(proof.date)}</div>
              </div>
              <span style={{ padding: "4px 10px", borderRadius: 20, background: "#2a2410", color: "#fbbf24", fontSize: 11, fontWeight: 700 }}>
                Revisar
              </span>
            </div>
          ))}

          {/* Historial de comprobantes revisados */}
          {paymentProofs.filter(p => p.status !== "pendiente").length > 0 && (
            <>
              <h3 style={{ color: "#94a3b8", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, margin: "24px 0 10px", letterSpacing: 1 }}>Historial</h3>
              {paymentProofs.filter(p => p.status !== "pendiente").slice(0, 10).map(proof => (
                <div key={proof.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "#0d1015", borderRadius: 10, padding: "8px 14px",
                  marginBottom: 4, border: "1px solid #1e2d40"
                }}>
                  <div style={{ flex: 1, fontSize: 13, color: "#94a3b8" }}>
                    {proof.athleteName} · {proof.month} · ${proof.amount}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                    background: proof.status === "aprobado" ? "#0d2818" : "#2a1215",
                    color: proof.status === "aprobado" ? "#34d399" : "#f87171"
                  }}>
                    {proof.status === "aprobado" ? "✅ Aprobado" : "❌ Rechazado"}
                  </span>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* === SECCIÓN USUARIOS === */}
      {activeSection === "usuarios" && (
        <>
          <h3 style={{ color: "#60a5fa", fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, margin: "0 0 14px", letterSpacing: 1 }}>👥 Cuentas de Usuarios</h3>

          {userMsg && (
            <div style={{
              padding: "10px 16px", borderRadius: 10, marginBottom: 14, fontSize: 13, fontWeight: 600,
              background: userMsg.includes("✅") ? "#0d2818" : "#2a1215",
              color: userMsg.includes("✅") ? "#34d399" : "#f87171"
            }}>
              {userMsg}
            </div>
          )}

          {/* Atletas SIN cuenta */}
          {(() => {
            const athletesWithoutAccount = athletes.filter(a => 
              a.status === "activo" && !(users || []).find(u => u.athleteId === a.id)
            );
            
            if (athletesWithoutAccount.length > 0) {
              return (
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>
                    ⚠️ Sin cuenta ({athletesWithoutAccount.length})
                  </h4>
                  {athletesWithoutAccount.map(a => (
                    <div key={a.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      background: "#111827", borderRadius: 12, padding: "10px 14px",
                      marginBottom: 6, border: "1px solid #2a3a50"
                    }}>
                      <Avatar src={a.photo} name={a.name} size={38} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{a.category}</div>
                      </div>
                      <Btn onClick={() => { setShowCreateUser(a); setNewUsername(""); setNewPassword(""); }} style={{ fontSize: 11, padding: "6px 12px" }}>
                        Crear cuenta
                      </Btn>
                    </div>
                  ))}
                </div>
              );
            }
            return (
              <div style={{ padding: 14, background: "#0d2818", borderRadius: 10, color: "#34d399", fontSize: 13, marginBottom: 20 }}>
                ✅ Todos los atletas activos tienen cuenta
              </div>
            );
          })()}

          {/* Lista de usuarios existentes */}
          <h4 style={{ color: "#94a3b8", fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>
            Cuentas activas ({(users || []).length})
          </h4>
          {(users || []).map(u => {
            const athlete = athletes.find(a => a.id === u.athleteId);
            return (
              <div key={u.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#0d1015", borderRadius: 10, padding: "8px 14px",
                marginBottom: 4, border: "1px solid #1e2d40"
              }}>
                <Avatar src={athlete?.photo} name={athlete?.name || u.username} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{athlete?.name || "Admin"}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    Usuario: <span style={{ color: "#60a5fa" }}>{u.username}</span> · Clave: <span style={{ color: "#94a3b8" }}>{u.password}</span>
                  </div>
                </div>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 6, fontWeight: 700,
                  background: u.role === "admin" ? "#1a1040" : "#0f1d3a",
                  color: u.role === "admin" ? "#a78bfa" : "#60a5fa"
                }}>
                  {u.role === "admin" ? "ADMIN" : "USUARIO"}
                </span>
              </div>
            );
          })}
        </>
      )}

      {/* Modal: Crear cuenta para atleta existente */}
      <Modal open={!!showCreateUser} onClose={() => setShowCreateUser(null)} title={`Crear cuenta — ${showCreateUser?.name}`}>
        {showCreateUser && (
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
              <Avatar src={showCreateUser.photo} name={showCreateUser.name} size={48} />
              <div>
                <div style={{ fontWeight: 700, color: "#e2e8f0" }}>{showCreateUser.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{showCreateUser.category} · #{showCreateUser.uniformNumber}</div>
              </div>
            </div>
            <Input label="Usuario" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Ej: jperez" />
            <Input label="Contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 4 caracteres" />
            <Btn onClick={async () => {
              if (!newUsername || !newPassword) { setUserMsg("Usuario y contraseña son obligatorios"); return; }
              if ((users || []).find(u => u.username === newUsername)) { setUserMsg("Ese usuario ya existe"); return; }
              const newUser = { id: generateId(), username: newUsername, password: newPassword, role: "user", athleteId: showCreateUser.id };
              const updated = [...(users || []), newUser];
              setUsers(updated);
              await saveData("lobos-users", updated);
              setShowCreateUser(null);
              setNewUsername(""); setNewPassword("");
              setUserMsg(`✅ Cuenta creada para ${showCreateUser.name}: usuario "${newUsername}"`);
              setTimeout(() => setUserMsg(""), 4000);
            }} style={{ width: "100%", marginTop: 10 }}>
              Crear Cuenta
            </Btn>
          </div>
        )}
      </Modal>

      {/* Modal: Registrar pago manual */}
      <Modal open={!!showPay} onClose={() => setShowPay(null)} title={`Pago — ${showPay?.name}`}>
        <Input label="Monto ($)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <Input label="Referencia (opcional)" value={ref} onChange={e => setRef(e.target.value)} />
        <Btn onClick={registerPayment} style={{ marginTop: 10 }}>Confirmar Pago</Btn>
      </Modal>

      {/* Modal: Revisar comprobante */}
      <Modal open={!!viewProof} onClose={() => setViewProof(null)} title="Revisar Comprobante">
        {viewProof && (
          <div>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
              <Avatar src={athletes.find(a => a.id === viewProof.athleteId)?.photo} name={viewProof.athleteName} size={48} />
              <div>
                <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 16 }}>{viewProof.athleteName}</div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>
                  {monthOptions.find(o => o.value === viewProof.month)?.label || viewProof.month} · ${viewProof.amount}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Ref: {viewProof.ref || "N/A"} · {formatDate(viewProof.date)}</div>
              </div>
            </div>

            {viewProof.proofUrl && (
              <img src={viewProof.proofUrl} style={{
                width: "100%", maxHeight: 350, objectFit: "contain",
                borderRadius: 12, border: "1px solid #2a3a50", marginBottom: 16
              }} />
            )}

            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <Btn onClick={() => approveProof(viewProof)} style={{ flex: 1, background: "linear-gradient(135deg, #059669, #047857)", fontSize: 14 }}>
                ✅ Aprobar Pago
              </Btn>
            </div>

            <div style={{ background: "#1a1018", borderRadius: 12, padding: 14, border: "1px solid #331122" }}>
              <Input label="Motivo de rechazo (opcional)" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Ej: Monto incorrecto" />
              <Btn variant="danger" onClick={() => rejectProof(viewProof)} style={{ width: "100%", fontSize: 13 }}>
                ❌ Rechazar
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}