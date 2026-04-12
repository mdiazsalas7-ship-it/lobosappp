import React from 'react';

export const LOGO_SRC = "https://i.postimg.cc/YCQvV93C/image.png";

// Colores Institucionales Lobos de Ribas
const GOLD = "#c4a35a";
const BLUE_SOLID = "#1e3a5f";
const BLUE_DEEP = "#0f172a";
const BLUE_CARD = "#111827";
const BLUE_SURFACE = "#1a2332";
const BORDER = "#2a3a50";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_MUTED = "#64748b";

const METAL_BLUE_GRADIENT = "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)";

export function WolfLogo({ size = 48 }) {
  return <img src={LOGO_SRC} alt="Lobos de Ribas" style={{ width: size, height: size, objectFit: "contain" }} />;
}

export function Avatar({ src, name, size = 48 }) {
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: `2px solid ${GOLD}` }} />;
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: BLUE_SURFACE, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, fontWeight: 700, fontSize: size * 0.38, border: `2px solid ${GOLD}` }}>
      {initials}
    </div>
  );
}

export function StatCard({ label, value, icon, color = GOLD, onClick }) {
  return (
    <div 
      onClick={onClick} 
      style={{ 
        background: BLUE_CARD, borderRadius: 20, padding: "20px", flex: "1 1 200px", minWidth: 180, 
        border: `1px solid ${BORDER}`, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        cursor: onClick ? "pointer" : "default", transition: "all 0.3s ease",
        display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden"
      }}
    >
      <div style={{
        width: 54, height: 54, borderRadius: 16, background: `${color}15`, 
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, border: `1px solid ${color}30`, flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 11, color: TEXT_SECONDARY, textTransform: "uppercase", fontWeight: 800, letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 34, fontWeight: 900, color: GOLD, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  );
}

export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, color: GOLD, marginBottom: 4, textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>{label}</label>}
      <input {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: BLUE_DEEP, color: TEXT_PRIMARY, fontSize: 15, outline: "none", boxSizing: "border-box", ...props.style }} />
    </div>
  );
}

export function Select({ label, options, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, color: GOLD, marginBottom: 4, textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.5 }}>{label}</label>}
      <select {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, background: BLUE_DEEP, color: TEXT_PRIMARY, fontSize: 15, outline: "none", ...props.style }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Btn({ children, variant = "primary", ...props }) {
  let btnBg = METAL_BLUE_GRADIENT;
  let btnColor = "#ffffff";
  let btnBorder = "none";

  if (variant === "danger") {
    btnBg = "linear-gradient(135deg, #aa3344 0%, #771122 100%)";
  } else if (variant === "ghost") {
    btnBg = "transparent";
    btnColor = TEXT_PRIMARY;
    btnBorder = `1px solid ${BORDER}`;
  }

  return (
    <button 
      {...props} 
      style={{ 
        background: btnBg, 
        color: btnColor,
        border: btnBorder,
        padding: "12px 24px", 
        borderRadius: 12, 
        fontWeight: "700", 
        fontSize: "14px", 
        cursor: "pointer", 
        letterSpacing: "0.5px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: variant !== "ghost" ? "0 4px 15px rgba(0,0,0,0.3)" : "none",
        transition: "all 0.2s ease",
        WebkitAppearance: "none",
        appearance: "none",
        ...(props.style || {}) 
      }}
    >
      {children}
    </button>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(8px)", padding: "20px" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: BLUE_CARD, borderRadius: 20, padding: 28, maxWidth: 520, width: "100%", maxHeight: "85vh", overflow: "auto", border: `2px solid ${GOLD}`, boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: `1px solid ${BORDER}`, paddingBottom: 10 }}>
          <h3 style={{ margin: 0, color: GOLD, fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 1 }}>{title}</h3>
          <span onClick={onClose} style={{ cursor: "pointer", fontSize: 22, color: TEXT_MUTED, transition: "color 0.2s" }}>✕</span>
        </div>
        {children}
      </div>
    </div>
  );
}