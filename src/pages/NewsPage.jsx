import React, { useState } from 'react';
import { Avatar, Input, Btn } from '../components/UIComponents';
import { generateId, saveData, formatDate, getBirthdaysThisMonth, getAge, getDaysUntilBirthday } from '../utils/helpers';

export default function NewsPage({ news, setNews, athletes, isAdmin = false }) {
  const [form, setForm] = useState({ title: "", body: "" });
  const [msg, setMsg] = useState("");

  const addNews = () => {
    if (!form.title || !form.body) return;
    const updated = [{ id: generateId(), ...form, date: new Date().toISOString() }, ...news];
    setNews(updated);
    saveData("lobos-news", updated);
    setForm({ title: "", body: "" });
    setMsg("✅ Noticia publicada");
    setTimeout(() => setMsg(""), 2500);
  };

  const deleteNews = (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta noticia?")) return;
    const updated = news.filter(n => n.id !== id);
    setNews(updated);
    saveData("lobos-news", updated);
  };

  const bdays = getBirthdaysThisMonth(athletes);

  return (
    <div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#c4a35a", letterSpacing: 2, marginBottom: 16 }}>Noticias</h2>

      {/* Cumpleañeros del mes */}
      {bdays.length > 0 && (
        <div style={{ background: "#111827", borderRadius: 16, padding: 18, marginBottom: 20, border: "1px solid #2a3a50" }}>
          <h3 style={{ color: "#60a5fa", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, margin: "0 0 10px" }}>🎂 Cumpleañeros del mes</h3>
          {bdays.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Avatar src={a.photo} name={a.name} size={32} />
              <span style={{ color: "#e2e8f0", fontSize: 14 }}>{a.name} — {formatDate(a.birthDate)} ({getAge(a.birthDate) + (getDaysUntilBirthday(a.birthDate) === 0 ? 0 : 1)} años)</span>
              {getDaysUntilBirthday(a.birthDate) === 0 && <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700 }}>¡HOY! 🎉</span>}
            </div>
          ))}
        </div>
      )}

      {/* Formulario publicar — solo admin */}
      {isAdmin && (
        <div style={{ background: "#111827", borderRadius: 16, padding: 18, marginBottom: 24, border: "1px solid #2a3a50" }}>
          <h3 style={{ color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, margin: "0 0 12px" }}>Publicar Noticia</h3>
          {msg && <div style={{ padding: "8px 12px", borderRadius: 8, background: "#0d2818", color: "#34d399", marginBottom: 10, fontSize: 13, fontWeight: 600 }}>{msg}</div>}
          <Input label="Título" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: "#c4a35a", marginBottom: 4, textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>Contenido</label>
            <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #2a3a50", background: "#0f172a", color: "#f1f5f9", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <Btn onClick={addNews}>Publicar</Btn>
        </div>
      )}

      {/* Lista de noticias */}
      {news.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", background: "#111827", borderRadius: 16, border: "1px dashed #2a3a50" }}>
          Aún no hay noticias publicadas.
        </div>
      )}

      {news.map(n => (
        <div key={n.id} style={{ background: "#111827", borderRadius: 14, padding: "14px 18px", marginBottom: 10, border: "1px solid #1e2d40" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#60a5fa", marginBottom: 3 }}>{formatDate(n.date)}</div>
              <div style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: "#94a3b8", whiteSpace: "pre-wrap" }}>{n.body}</div>
            </div>
            {isAdmin && (
              <span onClick={() => deleteNews(n.id)} style={{ cursor: "pointer", color: "#64748b", fontSize: 16, marginLeft: 10, padding: 4 }}>🗑</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}