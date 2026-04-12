import { useState, useEffect } from "react";
import { loadData } from "./utils/helpers";
import { WolfLogo } from "./components/UIComponents";

import DashboardPage from "./pages/DashboardPage";
import AthletesPage from "./pages/AthletesPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import GalleryPage from "./pages/GalleryPage";

const TABS = [
  { id: "Dashboard", label: "Inicio", icon: "📊" },
  { id: "Atletas", label: "Atletas", icon: "🏀" },
  { id: "Registrar", label: "Registro", icon: "📝" },
  { id: "Administrativo", label: "Admin", icon: "💰" },
  { id: "Galeria", label: "Galería", icon: "📸" } 
];

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [athletes, setAthletes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [a, p, n, g] = await Promise.all([
        loadData("lobos-athletes", []),
        loadData("lobos-payments", []),
        loadData("lobos-news", []),
        loadData("lobos-gallery", [])
      ]);
      setAthletes(a); setPayments(p); setNews(n); setGallery(g || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f172a", color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", fontSize: 28 }}>
      Cargando...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      {/* --- HEADER AZUL METÁLICO --- */}
      <header style={{ 
        background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
        borderBottom: "3px solid #c4a35a",
        padding: "16px 20px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        gap: 16,
        position: "sticky", 
        top: 0, 
        zIndex: 100,
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
      }}>
        <div style={{ 
          width: 60, height: 60, 
          borderRadius: "50%", 
          background: "rgba(255,255,255,0.1)", 
          border: "2px solid #c4a35a",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden"
        }}>
          <WolfLogo size={70} /> 
        </div>
        
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: "#c4a35a", letterSpacing: 3, lineHeight: 1 }}>LOBOS DE RIBAS</div>
          <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase" }}>Escuela de Baloncesto</div>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px", paddingBottom: 100 }}>
        {tab === "Dashboard" && <DashboardPage athletes={athletes} payments={payments} news={news} gallery={gallery} setTab={setTab} setAthletes={setAthletes} />}
        {tab === "Atletas" && <AthletesPage athletes={athletes} setAthletes={setAthletes} payments={payments} />}
        {tab === "Registrar" && <RegisterPage athletes={athletes} setAthletes={setAthletes} />}
        {tab === "Administrativo" && <AdminPage athletes={athletes} payments={payments} setPayments={setPayments} />}
        {tab === "Galeria" && <GalleryPage gallery={gallery} setGallery={setGallery} />}
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
        {TABS.map(t => (
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
    </div>
  );
}