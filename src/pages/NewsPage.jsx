import React, { useState } from 'react';
import { Avatar, Input, Btn } from '../components/UIComponents';
import { generateId, saveData, formatDate, getBirthdaysThisMonth, getAge, getDaysUntilBirthday } from '../utils/helpers';

export default function NewsPage({ news, setNews, athletes }) {
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
    const updated = news.filter(n => n.id !== id);
    setNews(updated);
    saveData("lobos-news", updated);
  };

  const bdays = getBirthdaysThisMonth(athletes);

  return (
    <div>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#c4a35a", letterSpacing: 2, marginBottom: 16 }}>Noticias</h2>

      {bdays.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #1a1a3e, #2a1a3e)", borderRadius: 16, padding: 18, marginBottom: 20, border: "1px solid #443366" }}>
          <h3 style={{ color: "#bb88ff", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, margin: "0 0 10px" }}>🎂 Cumpleañeros del mes</h3>
          {bdays.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Avatar src={a.photo} name={a.name} size={32} />
              <span style={{ color: "#ddd", fontSize: 14 }}>{a.name} — {formatDate(a.birthDate)} ({getAge(a.birthDate) + (getDaysUntilBirthday(a.birthDate) === 0 ? 0 : 1)} años)</span>
              {getDaysUntilBirthday(a.birthDate) === 0 && <span style={{ fontSize: 12, color: "#ffcc00", fontWeight: 700 }}>¡HOY! 🎉</span>}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "#111122", borderRadius: 16, padding: 18, marginBottom: 24, border: "1px solid #222240" }}>
        <h3 style={{ color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, margin: "0 0 12px" }}>Publicar Noticia</h3>
        {msg && <div style={{ padding: "8px 12px", borderRadius: 8, background: "#1a3a2a", color: "#44cc88", marginBottom: 10, fontSize: 13 }}>{msg}</div>}
        <Input label="Título" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, color: "#8888aa", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Contenido</label>
          <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #333355", background: "#0d0d1a", color: "#eee", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <Btn onClick={addNews}>Publicar</Btn>
      </div>

      {news.map(n => (
        <div key={n.id} style={{ background: "#111122", borderRadius: 14, padding: "14px 18px", marginBottom: 10, border: "1px solid #222240" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 11, color: "#6699ff", marginBottom: 3 }}>{formatDate(n.date)}</div>
              <div style={{ fontWeight: 700, color: "#ddd", marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: 13, color: "#999", whiteSpace: "pre-wrap" }}>{n.body}</div>
            </div>
            <span onClick={() => deleteNews(n.id)} style={{ cursor: "pointer", color: "#555", fontSize: 16 }}>🗑</span>
          </div>
        </div>
      ))}
    </div>
  );
}