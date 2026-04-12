import { useState, useEffect } from "react";
import { loadData } from "./utils/helpers";
import { WolfLogo, Modal, Btn } from "./components/UIComponents";

import DashboardPage from "./pages/DashboardPage";
import AthletesPage from "./pages/AthletesPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import GalleryPage from "./pages/GalleryPage";
import NewsPage from "./pages/NewsPage";

const PUBLIC_TABS = [
  { id: "Atletas", label: "Atletas", icon: "🏀" },
  { id: "Noticias", label: "Noticias", icon: "📰" },
  { id: "Galeria", label: "Galería", icon: "📸" }
];

const ADMIN_TABS = [
  { id: "Dashboard", label: "Inicio", icon: "📊" },
  { id: "Atletas", label: "Atletas", icon: "🏀" },
  { id: "Registrar", label: "Registro", icon: "📝" },
  { id: "Administrativo", label: "Admin", icon: "💰" },
  { id: "Noticias", label: "Noticias", icon: "📰" },
  { id: "Galeria", label: "Galería", icon: "📸" }
];

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState("1234");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const [tab, setTab] = useState("Atletas");
  const [athletes, setAthletes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [a, p, n, g, pin] = await Promise.all([
        loadData("lobos-athletes", []),
        loadData("lobos-payments", []),
        loadData("lobos-news", []),
        loadData("lobos-gallery", []),
        loadData("lobos-pin", "1234")
      ]);
      setAthletes(a); setPayments(p); setNews(n); setGallery(g || []);
      if (pin && typeof pin === "string") setAdminPin(pin);
      setLoading(false);
    })();
  }, []);

  const handlePinSubmit = () => {
    if (pinInput === adminPin) {
      setIsAdmin(true);
      setShowPinModal(false);
      setPinInput("");
      setPinError("");
      setTab("Dashboard");
    } else {
      setPinError("PIN incorrecto. Intenta de nuevo.");
      setPinInput("");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setTab("Atletas");
  };

  const tabs = isAdmin ? ADMIN_TABS : PUBLIC_TABS;

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f172a", color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, gap: 16 }}>
      <WolfLogo size={80} />
      Cargando...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* --- HEADER --- */}
      <header style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
        borderBottom: "3px solid #c4a35a",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 50, height: 50,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            border: "2px solid #c4a35a",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden"
          }}>
            <WolfLogo size={58} />
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: "#c4a35a", letterSpacing: 3, lineHeight: 1 }}>LOBOS DE RIBAS</div>
            <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase" }}>Escuela de Baloncesto</div>
          </div>
        </div>

        {/* Candado / Admin toggle */}
        <button
          onClick={() => isAdmin ? handleLogout() : setShowPinModal(true)}
          style={{
            background: isAdmin ? "rgba(196, 163, 90, 0.15)" : "rgba(255,255,255,0.08)",
            border: isAdmin ? "1px solid #c4a35a" : "1px solid #2a3a50",
            borderRadius: 12,
            padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 8,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
        >
          <span style={{ fontSize: 18 }}>{isAdmin ? "🔓" : "🔒"}</span>
          <span style={{ fontSize: 11, color: isAdmin ? "#c4a35a" : "#64748b", fontWeight: 700, letterSpacing: 0.5 }}>
            {isAdmin ? "Admin" : ""}
          </span>
        </button>
      </header>

      {/* Banner modo público */}
      {!isAdmin && (
        <div style={{
          background: "rgba(196, 163, 90, 0.08)",
          borderBottom: "1px solid rgba(196, 163, 90, 0.15)",
          padding: "8px 20px",
          textAlign: "center",
          fontSize: 12,
          color: "#94a3b8"
        }}>
          👁️ Modo lectura — Toca el candado para acceso administrativo
        </div>
      )}

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px", paddingBottom: 100 }}>
        {tab === "Dashboard" && isAdmin && <DashboardPage athletes={athletes} payments={payments} news={news} gallery={gallery} setTab={setTab} setAthletes={setAthletes} />}
        {tab === "Atletas" && <AthletesPage athletes={athletes} setAthletes={setAthletes} payments={payments} isAdmin={isAdmin} />}
        {tab === "Registrar" && isAdmin && <RegisterPage athletes={athletes} setAthletes={setAthletes} />}
        {tab === "Administrativo" && isAdmin && <AdminPage athletes={athletes} payments={payments} setPayments={setPayments} />}
        {tab === "Noticias" && <NewsPage news={news} setNews={setNews} athletes={athletes} isAdmin={isAdmin} />}
        {tab === "Galeria" && <GalleryPage gallery={gallery} setGallery={setGallery} isAdmin={isAdmin} />}
      </main>

      {/* --- NAV INFERIOR --- */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#111827",
        borderTop: "2px solid #c4a35a",
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 5px",
        zIndex: 999,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.4)"
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", border: "none", background: "transparent",
            color: tab === t.id ? "#c4a35a" : "#64748b", cursor: "pointer",
            transition: "color 0.2s"
          }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700 }}>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* --- MODAL PIN --- */}
      <Modal open={showPinModal} onClose={() => { setShowPinModal(false); setPinInput(""); setPinError(""); }} title="">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0" }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "rgba(196, 163, 90, 0.1)",
            border: "2px solid #c4a35a",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20
          }}>
            <WolfLogo size={70} />
          </div>

          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 24, color: "#c4a35a",
            letterSpacing: 2, marginBottom: 6
          }}>
            ACCESO ADMINISTRATIVO
          </h3>
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24, textAlign: "center" }}>
            Ingresa el PIN para gestionar atletas, pagos y registros
          </p>

          {pinError && (
            <div style={{
              background: "#2a1215", color: "#f87171",
              padding: "10px 16px", borderRadius: 10,
              fontSize: 13, fontWeight: 600,
              marginBottom: 16, width: "100%", textAlign: "center"
            }}>
              {pinError}
            </div>
          )}

          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={10}
            placeholder="Ingresa el PIN"
            value={pinInput}
            onChange={e => { setPinInput(e.target.value); setPinError(""); }}
            onKeyDown={e => e.key === "Enter" && handlePinSubmit()}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: 12,
              border: pinError ? "2px solid #f87171" : "2px solid #2a3a50",
              background: "#0f172a",
              color: "#f1f5f9",
              fontSize: 22,
              textAlign: "center",
              letterSpacing: 8,
              fontWeight: 700,
              outline: "none",
              marginBottom: 20,
              fontFamily: "'Bebas Neue', sans-serif"
            }}
            autoFocus
          />

          <Btn onClick={handlePinSubmit} style={{ width: "100%", padding: "14px", fontSize: 16 }}>
            🔐 Ingresar
          </Btn>
        </div>
      </Modal>
    </div>
  );
}