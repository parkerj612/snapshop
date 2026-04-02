import React from 'react';

export default function Header({ screen, onNavigate, onSettings }) {
  return (
    <div style={{
      padding: "20px 20px 0",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ cursor: "pointer" }} onClick={() => onNavigate("home")}>
        <div style={{
          fontSize: 24, fontWeight: 800,
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, #E8A838, #F0C05A)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>SnapShop</div>
        <div style={{
          fontSize: 9, color: "rgba(255,255,255,0.25)",
          letterSpacing: 3, textTransform: "uppercase",
        }}>Scan · Compare · Buy</div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => onNavigate(screen === "history" ? "home" : "history")} style={{
          background: screen === "history" ? "rgba(232,168,56,0.15)" : "rgba(255,255,255,0.06)",
          border: screen === "history" ? "1px solid rgba(232,168,56,0.3)" : "1px solid rgba(255,255,255,0.08)",
          color: "#fff", borderRadius: 10, width: 38, height: 38, fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>📋</button>
        <button onClick={onSettings} style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff", borderRadius: 10, width: 38, height: 38, fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>⚙️</button>
      </div>
    </div>
  );
}
