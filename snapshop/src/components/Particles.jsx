import React, { useMemo } from 'react';

export default function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      w: Math.random() * 4 + 2,
      hue: 40 + Math.random() * 25,
      alpha: Math.random() * 0.1 + 0.04,
      left: Math.random() * 100,
      top: Math.random() * 100,
      dur: 8 + Math.random() * 12,
      delay: -Math.random() * 10,
    })), []);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          width: p.w, height: p.w,
          borderRadius: "50%",
          background: `hsla(${p.hue}, 85%, 55%, ${p.alpha})`,
          left: `${p.left}%`, top: `${p.top}%`,
          animation: `floatP ${p.dur}s ease-in-out infinite`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}
    </div>
  );
}
