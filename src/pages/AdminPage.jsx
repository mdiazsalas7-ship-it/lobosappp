import React, { useState } from 'react';
import { Select, StatCard, Avatar, Btn, Modal, Input } from '../components/UIComponents';
import { generateId, saveData, formatDate, MONTHS } from '../utils/helpers';

export default function AdminPage({ athletes, payments, setPayments }) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const [selMonth, setSelMonth] = useState(currentMonth);
  const [showPay, setShowPay] = useState(null);
  const [amount, setAmount] = useState(""); 
  const [ref, setRef] = useState("");

  const activeAthletes = athletes.filter(a => a.status === "activo");
  const getPaymentForMonth = (athleteId, month) => payments.find(p => p.athleteId === athleteId && p.month === month);

  const morosos = activeAthletes.filter(a => !getPaymentForMonth(a.id, selMonth));
  const solventes = activeAthletes.filter(a => getPaymentForMonth(a.id, selMonth));

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

      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <Select label="Mes" value={selMonth} onChange={e => setSelMonth(e.target.value)} options={monthOptions} />
        <StatCard icon="💰" label="Recaudado" value={`$${totalCollected.toLocaleString()}`} color="#44cc88" />
        <StatCard icon="⚠️" label="Morosos" value={morosos.length} color="#ee5566" />
        <StatCard icon="✅" label="Solventes" value={solventes.length} color="#44cc88" />
      </div>

      <h3 style={{ color: "#ee5566", fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, margin: "20px 0 10px", letterSpacing: 1 }}>⚠️ Morosos — {monthOptions.find(o => o.value === selMonth)?.label}</h3>
      {morosos.length === 0 ? <div style={{ color: "#44cc88", fontSize: 14, padding: 12 }}>¡Todos al día! 🎉</div> : (
        <div style={{ display: "grid", gap: 8 }}>
          {morosos.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#1a1018", borderRadius: 12, padding: "10px 14px", border: "1px solid #331122" }}>
              <Avatar src={a.photo} name={a.name} size={38} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "#ddd", fontSize: 14 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: "#8888aa" }}>{a.category} · Rep: {a.repName || "N/A"} · Tel: {a.repPhone || "N/A"}</div>
              </div>
              <Btn onClick={() => { setShowPay(a); setAmount(""); setRef(""); }} style={{ fontSize: 12, padding: "6px 14px" }}>Registrar Pago</Btn>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ color: "#44cc88", fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, margin: "24px 0 10px", letterSpacing: 1 }}>✅ Solventes</h3>
      <div style={{ display: "grid", gap: 6 }}>
        {solventes.map(a => {
          const p = getPaymentForMonth(a.id, selMonth);
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#101a18", borderRadius: 12, padding: "8px 14px", border: "1px solid #113322" }}>
              <Avatar src={a.photo} name={a.name} size={34} />
              <div style={{ flex: 1, fontSize: 14, color: "#ccc" }}>{a.name}</div>
              <div style={{ fontSize: 12, color: "#44cc88" }}>${p?.amount} — {formatDate(p?.date)}</div>
            </div>
          );
        })}
      </div>

      <Modal open={!!showPay} onClose={() => setShowPay(null)} title={`Pago — ${showPay?.name}`}>
        <Input label="Monto ($)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <Input label="Referencia (opcional)" value={ref} onChange={e => setRef(e.target.value)} />
        <Btn onClick={registerPayment} style={{ marginTop: 10 }}>Confirmar Pago</Btn>
      </Modal>
    </div>
  );
}