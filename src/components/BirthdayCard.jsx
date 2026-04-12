import React from 'react';
import { WolfLogo } from './UIComponents';

// SVG Balloon component
function Balloon({ x, y, color, size = 1, delay = 0 }) {
  const s = 28 * size;
  return (
    <g style={{ animation: `floatBalloon 3s ease-in-out ${delay}s infinite alternate` }}>
      {/* String */}
      <path d={`M${x},${y + s * 1.1} Q${x + 3},${y + s * 1.6} ${x - 2},${y + s * 2.1}`} 
        stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
      {/* Balloon body */}
      <ellipse cx={x} cy={y} rx={s * 0.55} ry={s * 0.7} fill={color} opacity="0.85" />
      {/* Shine */}
      <ellipse cx={x - s * 0.15} cy={y - s * 0.2} rx={s * 0.12} ry={s * 0.22} fill="rgba(255,255,255,0.35)" transform={`rotate(-20 ${x - s * 0.15} ${y - s * 0.2})`} />
      {/* Knot */}
      <polygon points={`${x - 3},${y + s * 0.68} ${x + 3},${y + s * 0.68} ${x},${y + s * 0.85}`} fill={color} opacity="0.9" />
    </g>
  );
}

// Confetti piece
function Confetti({ x, y, color, rotation, size = 1, shape = 'rect', delay = 0 }) {
  const animName = `confettiFall${Math.floor(delay * 10) % 5}`;
  const style = { 
    animation: `${animName} ${2 + delay}s ease-in-out ${delay * 0.3}s infinite`,
    transformOrigin: `${x}px ${y}px`
  };
  
  if (shape === 'circle') {
    return <circle cx={x} cy={y} r={3 * size} fill={color} opacity="0.8" style={style} />;
  }
  if (shape === 'star') {
    const s = 4 * size;
    return (
      <polygon 
        points={`${x},${y-s} ${x+s*0.3},${y-s*0.3} ${x+s},${y} ${x+s*0.3},${y+s*0.3} ${x},${y+s} ${x-s*0.3},${y+s*0.3} ${x-s},${y} ${x-s*0.3},${y-s*0.3}`}
        fill={color} opacity="0.9" style={style}
        transform={`rotate(${rotation} ${x} ${y})`}
      />
    );
  }
  return (
    <rect x={x} y={y} width={8 * size} height={5 * size} rx={1} fill={color} opacity="0.8"
      transform={`rotate(${rotation} ${x} ${y})`} style={style} />
  );
}

// Sparkle star
function Sparkle({ x, y, size = 1, delay = 0 }) {
  return (
    <g style={{ animation: `sparkle 1.5s ease-in-out ${delay}s infinite` }}>
      <line x1={x - 5 * size} y1={y} x2={x + 5 * size} y2={y} stroke="#ffcc00" strokeWidth={1.5} />
      <line x1={x} y1={y - 5 * size} x2={x} y2={y + 5 * size} stroke="#ffcc00" strokeWidth={1.5} />
      <line x1={x - 3 * size} y1={y - 3 * size} x2={x + 3 * size} y2={y + 3 * size} stroke="#ffcc00" strokeWidth={1} />
      <line x1={x + 3 * size} y1={y - 3 * size} x2={x - 3 * size} y2={y + 3 * size} stroke="#ffcc00" strokeWidth={1} />
    </g>
  );
}

const CONFETTI_COLORS = ['#c4a35a', '#ffcc00', '#ff6b8a', '#60a5fa', '#34d399', '#f472b6', '#a78bfa', '#fb923c'];
const BALLOON_COLORS = ['#c4a35a', '#60a5fa', '#f472b6', '#34d399', '#a78bfa'];

// Generate confetti pieces
function generateConfetti(width, height, count = 40) {
  const pieces = [];
  const shapes = ['rect', 'circle', 'star'];
  for (let i = 0; i < count; i++) {
    pieces.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.85,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotation: Math.random() * 360,
      size: 0.6 + Math.random() * 0.8,
      shape: shapes[i % shapes.length],
      delay: Math.random() * 3
    });
  }
  return pieces;
}

export default function BirthdayCard({ athlete, cardRef }) {
  const { name, photo, category, uniformNumber, position, birthDate } = athlete;
  
  const getAge = (bd) => {
    if (!bd) return 0;
    const now = new Date();
    const b = new Date(bd + 'T12:00:00');
    let age = now.getFullYear() - b.getFullYear();
    if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
    return age;
  };

  const age = getAge(birthDate);
  const confettiPieces = generateConfetti(380, 480, 45);

  return (
    <>
      <style>{`
        @keyframes floatBalloon {
          0% { transform: translateY(0px) rotate(-2deg); }
          100% { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes confettiFall0 {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0.9; }
          50% { transform: translateY(12px) rotate(180deg); opacity: 0.6; }
          100% { transform: translateY(0px) rotate(360deg); opacity: 0.9; }
        }
        @keyframes confettiFall1 {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.8; }
          50% { transform: translateY(8px) rotate(-90deg) scale(0.8); opacity: 1; }
          100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.8; }
        }
        @keyframes confettiFall2 {
          0% { transform: translateX(0) rotate(0deg); opacity: 0.7; }
          50% { transform: translateX(6px) rotate(120deg); opacity: 1; }
          100% { transform: translateX(0) rotate(0deg); opacity: 0.7; }
        }
        @keyframes confettiFall3 {
          0% { transform: translateY(0) scale(1); opacity: 0.9; }
          50% { transform: translateY(10px) scale(1.2); opacity: 0.5; }
          100% { transform: translateY(0) scale(1); opacity: 0.9; }
        }
        @keyframes confettiFall4 {
          0% { transform: rotate(0deg) translateY(0); opacity: 0.8; }
          50% { transform: rotate(200deg) translateY(6px); opacity: 1; }
          100% { transform: rotate(0deg) translateY(0); opacity: 0.8; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes bannerGlow {
          0%, 100% { box-shadow: 0 4px 20px rgba(196, 163, 90, 0.3); }
          50% { box-shadow: 0 4px 30px rgba(196, 163, 90, 0.6), 0 0 40px rgba(255, 204, 0, 0.2); }
        }
        @keyframes cardShine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      <div ref={cardRef} style={{ 
        width: "100%", maxWidth: 380, borderRadius: 20, overflow: 'hidden', 
        border: '3px solid #ffcc00', background: '#0a0a18', 
        boxShadow: '0 20px 60px rgba(0,0,0,.6), 0 0 30px rgba(196, 163, 90, 0.15)',
        position: 'relative'
      }}>
        {/* === FOTO PRINCIPAL === */}
        <div style={{ 
          position: 'relative', height: 400, 
          background: photo ? `url(${photo}) center 15% / cover no-repeat` : 'linear-gradient(135deg, #1a1a2e, #0d0d1a)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 20px'
        }}>
          {/* Overlay gradiente suave — respeta la foto */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.85) 85%, rgba(0,0,0,0.95) 100%)', zIndex: 0 }} />
          
          {/* Shine effect */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,.06) 45%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.06) 55%,transparent 60%)', backgroundSize: '200% 100%', animation: 'cardShine 4s ease-in-out infinite', pointerEvents: 'none', zIndex: 1 }} />

          {/* === CONFETTI + GLOBOS SVG OVERLAY === */}
          <svg viewBox="0 0 380 480" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}>
            {/* Confetti */}
            {confettiPieces.map((c, i) => (
              <Confetti key={i} {...c} />
            ))}

            {/* Globos — esquinas, no tapan el centro */}
            <Balloon x={35}  y={55}  color={BALLOON_COLORS[0]} size={1.1} delay={0} />
            <Balloon x={65}  y={85}  color={BALLOON_COLORS[1]} size={0.8} delay={0.5} />
            <Balloon x={345} y={50}  color={BALLOON_COLORS[2]} size={1.0} delay={0.3} />
            <Balloon x={315} y={80}  color={BALLOON_COLORS[3]} size={0.75} delay={0.8} />
            <Balloon x={50}  y={180} color={BALLOON_COLORS[4]} size={0.65} delay={1.2} />
            <Balloon x={340} y={170} color={BALLOON_COLORS[0]} size={0.7} delay={0.6} />

            {/* Sparkles */}
            <Sparkle x={100} y={40} size={1.2} delay={0} />
            <Sparkle x={280} y={60} size={1.0} delay={0.7} />
            <Sparkle x={190} y={30} size={0.8} delay={1.4} />
            <Sparkle x={60}  y={140} size={0.7} delay={0.4} />
            <Sparkle x={320} y={130} size={0.9} delay={1.0} />
          </svg>

          {/* HEADER: Logo + Categoría & Dorsal */}
          <div style={{ position: 'relative', zIndex: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: 20, border: '1px solid #c4a35a', backdropFilter: 'blur(4px)' }}>
              <WolfLogo size={20} />
              <span style={{ fontSize: 11, color: '#c4a35a', fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>{category}</span>
            </div>
            <div style={{ fontSize: 54, fontWeight: 900, color: '#fff', lineHeight: 0.8, textShadow: '0 4px 15px rgba(0,0,0,0.9)', fontStyle: 'italic', fontFamily: "'Bebas Neue', sans-serif" }}>
              #{uniformNumber || '--'}
            </div>
          </div>

          {/* FOOTER: Nombre + Tags + Banner Cumpleaños */}
          <div style={{ position: 'relative', zIndex: 3 }}>
            {/* Nombre */}
            <h2 style={{ fontSize: 30, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 8, textShadow: '0 3px 10px rgba(0,0,0,0.9)' }}>
              {name}
            </h2>
            
            {/* Tags */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ padding: '4px 14px', borderRadius: 20, background: '#c4a35a', fontSize: 12, fontWeight: 800, color: '#0a0a18' }}>{position || 'Jugador'}</span>
              <span style={{ padding: '4px 14px', borderRadius: 20, background: 'rgba(255,255,255,.15)', fontSize: 12, fontWeight: 800, color: '#fff', backdropFilter: 'blur(4px)' }}>Cumple {age} Años</span>
            </div>
          </div>
        </div>

        {/* === BANNER DE CUMPLEAÑOS — Debajo de la foto === */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1a1020 0%, #0f172a 50%, #1a1020 100%)',
          padding: '16px 20px', 
          textAlign: 'center', 
          position: 'relative', 
          overflow: 'hidden',
          borderTop: '2px solid #c4a35a'
        }}>
          {/* Fondo decorativo sutil */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.08, background: 'radial-gradient(circle at 20% 50%, #c4a35a 0%, transparent 50%), radial-gradient(circle at 80% 50%, #ffcc00 0%, transparent 50%)' }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>
              🎈 Lobos de Ribas celebra 🎈
            </div>
            <div style={{ 
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#c4a35a', 
              letterSpacing: 4, lineHeight: 1, marginBottom: 4,
              textShadow: '0 2px 10px rgba(196, 163, 90, 0.3)'
            }}>
              ¡FELIZ CUMPLEAÑOS!
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 6 }}>
              {['🎉', '🎂', '🏀', '🎂', '🎉'].map((emoji, i) => (
                <span key={i} style={{ fontSize: 18 }}>{emoji}</span>
              ))}
            </div>
          </div>
        </div>

        {/* === FOOTER LOBOS === */}
        <div style={{ 
          background: '#0a0a18', padding: '10px 20px', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid rgba(196, 163, 90, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WolfLogo size={18} />
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Escuela de Baloncesto</span>
          </div>
          <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>🐺 #SomosLobos</span>
        </div>
      </div>
    </>
  );
}