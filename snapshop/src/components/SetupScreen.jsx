import React, { useState } from 'react';
import { testApiKey } from '../services/vision';

export default function SetupScreen({ onSave, savedKey }) {
  const [key, setKey] = useState(savedKey || "");
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleTest = async () => {
    if (!key.trim()) return;
    setTesting(true);
    setStatus(null);
    const ok = await testApiKey(key.trim());
    setStatus(ok ? "success" : "error");
    setTesting(false);
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24, animation: "slideUp 0.5s ease-out" }}>
      <div style={{ textAlign: "center", paddingTop: 20 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 16px",
          background: "linear-gradient(135deg, #E8A838, #F0C05A)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
          boxShadow: "0 8px 32px rgba(232,168,56,0.3)",
        }}>🔑</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Setup Required</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
          SnapShop uses Google Cloud Vision to identify products from your camera. Enter your API key to get started.
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
          Google Cloud Vision API Key
        </label>
        <input
          type="password"
          value={key}
          onChange={(e) => { setKey(e.target.value); setStatus(null); }}
          placeholder="AIzaSy..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${status === "error" ? "rgba(255,80,80,0.4)" : status === "success" ? "rgba(76,209,112,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 12, padding: "14px 16px", color: "#fff", fontSize: 14,
            outline: "none", fontFamily: "monospace",
          }}
        />
        {status === "error" && <div style={{ fontSize: 12, color: "#FF5050", marginTop: 6 }}>Invalid key — check your Google Cloud Console.</div>}
        {status === "success" && <div style={{ fontSize: 12, color: "#4CD170", marginTop: 6 }}>Key verified!</div>}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={handleTest}
          disabled={!key.trim() || testing}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 10,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff", fontSize: 13, fontWeight: 600,
            cursor: key.trim() && !testing ? "pointer" : "default",
            opacity: key.trim() ? 1 : 0.4,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {testing ? "Testing..." : "Test Key"}
        </button>
        <button
          onClick={() => onSave(key.trim())}
          disabled={!key.trim()}
          style={{
            flex: 1, padding: "12px 0", borderRadius: 10,
            background: key.trim() ? "linear-gradient(135deg, #E8A838, #F0C05A)" : "rgba(255,255,255,0.06)",
            border: "none",
            color: key.trim() ? "#1A1200" : "rgba(255,255,255,0.3)",
            fontSize: 13, fontWeight: 700,
            cursor: key.trim() ? "pointer" : "default",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Save & Continue
        </button>
      </div>

      <div style={{
        background: "rgba(232,168,56,0.06)", border: "1px solid rgba(232,168,56,0.1)",
        borderRadius: 12, padding: 16,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#E8A838", marginBottom: 8 }}>How to get a key:</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
          1. Go to <strong style={{ color: "rgba(255,255,255,0.7)" }}>console.cloud.google.com</strong><br />
          2. Create a project (or select existing)<br />
          3. Enable <strong style={{ color: "rgba(255,255,255,0.7)" }}>Cloud Vision API</strong><br />
          4. Go to <strong style={{ color: "rgba(255,255,255,0.7)" }}>APIs & Services → Credentials</strong><br />
          5. Create an API Key → restrict to Cloud Vision API<br />
          6. Paste the key above
        </div>
      </div>

      <button
        onClick={() => onSave("DEMO_MODE")}
        style={{
          background: "none", border: "none", color: "rgba(255,255,255,0.3)",
          fontSize: 12, cursor: "pointer", padding: 8, fontFamily: "'Outfit', sans-serif",
        }}
      >
        Skip for now (demo mode — camera disabled)
      </button>
    </div>
  );
}
