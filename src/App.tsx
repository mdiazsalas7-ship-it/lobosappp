import { useState, useEffect } from "react";
import { loadData, saveData } from "./utils/helpers";
import { WolfLogo, Modal, Btn, Input } from "./components/UIComponents";

import DashboardPage from "./pages/DashboardPage";
import AthletesPage from "./pages/AthletesPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import GalleryPage from "./pages/GalleryPage";
import NewsPage from "./pages/NewsPage";
import UserHomePage from "./pages/UserHomePage";
import ConvocatoriaPage from "./pages/ConvocatoriaPage";

const ADMIN_TABS = [
  { id: "Dashboard", label: "Inicio", icon: "📊" },
  { id: "Atletas", label: "Atletas", icon: "🏀" },
  { id: "Convocatoria", label: "Convocatoria", icon: "📋" },
  { id: "Registrar", label: "Registro", icon: "📝" },
  { id: "Administrativo", label: "Admin", icon: "💰" },
  { id: "Noticias", label: "Noticias", icon: "📰" },
  { id: "Galeria", label: "Galería", icon: "📸" }
];

const USER_TABS = [
  { id: "MiPerfil", label: "Mi Perfil", icon: "🏠" },
  { id: "Atletas", label: "Atletas", icon: "🏀" },
  { id: "Noticias", label: "Noticias", icon: "📰" },
  { id: "Galeria", label: "Galería", icon: "📸" }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("MiPerfil");
  const [athletes, setAthletes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentProofs, setPaymentProofs] = useState([]);
  const [news, setNews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  // Login state
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    (async () => {
      const [a, p, n, g, u, pp] = await Promise.all([
        loadData("lobos-athletes", []),
        loadData("lobos-payments", []),
        loadData("lobos-news", []),
        loadData("lobos-gallery", []),
        loadData("lobos-users", []),
        loadData("lobos-payment-proofs", [])
      ]);
      setAthletes(a); setPayments(p); setNews(n); setGallery(g || []);
      setUsers(u || []);
      setPaymentProofs(pp || []);

      // Si no existe admin, crear uno por defecto
      if (!u || u.length === 0 || !u.find(x => x.role === "admin")) {
        const defaultAdmin = { id: "admin-default", username: "admin", password: "1234", role: "admin", athleteId: null };
        const updatedUsers = [...(u || []), defaultAdmin];
        setUsers(updatedUsers);
        await saveData("lobos-users", updatedUsers);
      }

      setLoading(false);
    })();
  }, []);

  const handleLogin = () => {
    const found = users.find(u => u.username === loginUser && u.password === loginPass);
    if (found) {
      setCurrentUser(found);
      setLoginError("");
      setLoginUser("");
      setLoginPass("");
      setTab(found.role === "admin" ? "Dashboard" : "MiPerfil");
    } else {
      setLoginError("Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setTab("MiPerfil");
    setLoginUser("");
    setLoginPass("");
  };

  const isAdmin = currentUser?.role === "admin";
  const tabs = isAdmin ? ADMIN_TABS : USER_TABS;

  // --- PANTALLA DE CARGA ---
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f172a", color: "#c4a35a", fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, gap: 16 }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      <WolfLogo size={80} />
      Cargando...
    </div>
  );

  // --- PANTALLA DE LOGIN ---
  if (!currentUser) return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{
          width: 100, height: 100, borderRadius: "50%", margin: "0 auto 20px",
          background: "rgba(196, 163, 90, 0.1)", border: "2px solid #c4a35a",
          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
        }}>
          <WolfLogo size={90} />
        </div>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: "#c4a35a", letterSpacing: 4, margin: "0 0 4px" }}>LOBOS DE RIBAS</h1>
        <p style={{ fontSize: 12, color: "#64748b", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 32px" }}>Escuela de Baloncesto</p>

        <div style={{
          background: "#111827", borderRadius: 20, padding: "28px 24px",
          border: "1px solid #2a3a50"
        }}>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#f1f5f9", letterSpacing: 2, margin: "0 0 20px" }}>Iniciar Sesión</h3>

          {loginError && (
            <div style={{ background: "#2a1215", color: "#f87171", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
              {loginError}
            </div>
          )}

          <Input label="Usuario" value={loginUser} onChange={e => { setLoginUser(e.target.value); setLoginError(""); }} placeholder="Ingresa tu usuario" />
          <Input label="Contraseña" type="password" value={loginPass} onChange={e => { setLoginPass(e.target.value); setLoginError(""); }} placeholder="Ingresa tu contraseña"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
          />

          <Btn onClick={handleLogin} style={{ width: "100%", padding: "14px", fontSize: 16, marginTop: 8 }}>
            Ingresar
          </Btn>
        </div>

        <p style={{ fontSize: 11, color: "#475569", marginTop: 20 }}>
          Contacta al entrenador si no tienes cuenta
        </p>
      </div>
    </div>
  );

  // --- APP PRINCIPAL ---
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />

      <header style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
        borderBottom: "3px solid #c4a35a",
        padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "2px solid #c4a35a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <WolfLogo size={48} />
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "#c4a35a", letterSpacing: 2, lineHeight: 1 }}>LOBOS DE RIBAS</div>
            <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1 }}>
              {isAdmin ? "🔑 Administrador" : `👤 ${currentUser.username}`}
            </div>
          </div>
        </div>

        <button onClick={handleLogout} style={{
          background: "rgba(248, 113, 113, 0.1)", border: "1px solid rgba(248, 113, 113, 0.3)",
          borderRadius: 10, padding: "8px 14px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6
        }}>
          <span style={{ fontSize: 14 }}>🚪</span>
          <span style={{ fontSize: 11, color: "#f87171", fontWeight: 700 }}>Salir</span>
        </button>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "20px 16px", paddingBottom: 100 }}>
        {/* ADMIN PAGES */}
        {tab === "Dashboard" && isAdmin && <DashboardPage athletes={athletes} payments={payments} news={news} gallery={gallery} setTab={setTab} setAthletes={setAthletes} />}
        {tab === "Atletas" && <AthletesPage athletes={athletes} setAthletes={setAthletes} payments={payments} isAdmin={isAdmin} />}
        {tab === "Convocatoria" && isAdmin && <ConvocatoriaPage athletes={athletes} news={news} setNews={setNews} />}
        {tab === "Registrar" && isAdmin && <RegisterPage athletes={athletes} setAthletes={setAthletes} users={users} setUsers={setUsers} payments={payments} setPayments={setPayments} />}
        {tab === "Administrativo" && isAdmin && <AdminPage athletes={athletes} payments={payments} setPayments={setPayments} paymentProofs={paymentProofs} setPaymentProofs={setPaymentProofs} users={users} setUsers={setUsers} />}
        {tab === "Noticias" && <NewsPage news={news} setNews={setNews} athletes={athletes} isAdmin={isAdmin} />}
        {tab === "Galeria" && <GalleryPage gallery={gallery} setGallery={setGallery} isAdmin={isAdmin} />}

        {/* USER PAGE */}
        {tab === "MiPerfil" && !isAdmin && <UserHomePage currentUser={currentUser} athletes={athletes} payments={payments} paymentProofs={paymentProofs} setPaymentProofs={setPaymentProofs} />}
      </main>

      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#111827", borderTop: "2px solid #c4a35a",
        display: "flex", justifyContent: "space-around",
        padding: "10px 5px", zIndex: 999,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.4)"
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            border: "none", background: "transparent",
            color: tab === t.id ? "#c4a35a" : "#64748b",
            cursor: "pointer", transition: "color 0.2s"
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700 }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}