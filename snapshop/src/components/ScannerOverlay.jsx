import React, { useState, useRef, useEffect } from 'react';
import { identifyProduct } from '../services/vision';

export default function ScannerOverlay({ onCapture, onClose, apiKey }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [status, setStatus] = useState("starting"); // starting | ready | capturing | analyzing

  // Start camera
  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        // Try rear camera first
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Camera error:", err);
          setCameraError(err.name === "NotAllowedError"
            ? "Camera permission denied. Please allow camera access in your browser settings."
            : err.name === "NotFoundError"
            ? "No camera found on this device."
            : `Camera error: ${err.message}`
          );
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Scan line animation
  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => setScanLine(p => (p >= 100 ? 0 : p + 2)), 30);
    return () => clearInterval(interval);
  }, [scanning]);

  const captureAndAnalyze = async () => {
    if (!cameraReady || scanning) return;
    setScanning(true);
    setStatus("capturing");

    // Brief delay for scan animation
    await new Promise(r => setTimeout(r, 1000));
    setStatus("analyzing");

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      onCapture({ error: "Camera not ready" });
      return;
    }

    // Capture frame
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1];

    // Stop camera before navigating
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    if (apiKey === "DEMO_MODE") {
      await new Promise(r => setTimeout(r, 500));
      onCapture({
        query: "wireless noise cancelling headphones",
        visionData: {
          bestGuess: "Demo Mode — add API key for real scanning",
          labels: ["Demo"], logos: [], objects: [], webEntities: [], pageTitles: [],
        },
        thumbnail: dataUrl,
      });
      return;
    }

    try {
      const visionData = await identifyProduct(base64, apiKey);

      // Build best search query from vision results
      const query =
        visionData.bestGuess ||
        visionData.webEntities[0] ||
        [...visionData.logos, ...visionData.objects, ...visionData.labels].filter(Boolean).slice(0, 3).join(" ") ||
        "product";

      onCapture({ query, visionData, thumbnail: dataUrl });
    } catch (err) {
      onCapture({ error: err.message, thumbnail: dataUrl });
    }
  };

  const statusText = {
    starting: "Starting camera...",
    ready: "Point at a product",
    capturing: "Capturing...",
    analyzing: "Identifying with Google Vision...",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100, background: "#000",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, padding: "16px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10,
        background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
      }}>
        <button onClick={() => {
          if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
          onClose();
        }} style={{
          background: "rgba(255,255,255,0.15)", border: "none", color: "#fff",
          width: 40, height: 40, borderRadius: "50%", fontSize: 20, cursor: "pointer",
          backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
        <span style={{ color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, opacity: 0.8 }}>
          {statusText[status]}
        </span>
        <div style={{ width: 40 }} />
      </div>

      {/* Camera error */}
      {cameraError ? (
        <div style={{ color: "#fff", textAlign: "center", padding: 40, fontFamily: "'Outfit', sans-serif" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📷</div>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Camera Unavailable</div>
          <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 24, maxWidth: 300 }}>{cameraError}</div>
          <button onClick={() => {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            onClose();
          }} style={{
            background: "linear-gradient(135deg, #E8A838, #F0C05A)", color: "#1A1200",
            border: "none", padding: "12px 32px", borderRadius: 12, fontSize: 14,
            fontWeight: 600, cursor: "pointer",
          }}>Go Back</button>
        </div>
      ) : (
        <>
          {/* Video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />

          {/* Scan frame */}
          <div style={{
            position: "absolute", width: 260, height: 260,
            border: "2px solid rgba(232,168,56,0.4)", borderRadius: 20,
          }}>
            {/* Corner accents */}
            {[
              { top: -2, left: -2, bT: true, bL: true },
              { top: -2, right: -2, bT: true, bR: true },
              { bottom: -2, left: -2, bB: true, bL: true },
              { bottom: -2, right: -2, bB: true, bR: true },
            ].map((corner, i) => (
              <div key={i} style={{
                position: "absolute", width: 28, height: 28,
                ...corner.top !== undefined && { top: corner.top },
                ...corner.bottom !== undefined && { bottom: corner.bottom },
                ...corner.left !== undefined && { left: corner.left },
                ...corner.right !== undefined && { right: corner.right },
                borderTop: corner.bT ? "3px solid #E8A838" : "none",
                borderBottom: corner.bB ? "3px solid #E8A838" : "none",
                borderLeft: corner.bL ? "3px solid #E8A838" : "none",
                borderRight: corner.bR ? "3px solid #E8A838" : "none",
              }} />
            ))}

            {/* Scan line */}
            {scanning && (
              <div style={{
                position: "absolute", left: 4, right: 4, height: 2,
                background: "linear-gradient(90deg, transparent, #E8A838, transparent)",
                top: `${scanLine}%`, transition: "top 0.03s linear",
                boxShadow: "0 0 20px #E8A838, 0 0 40px rgba(232,168,56,0.3)",
              }} />
            )}
          </div>

          {/* Analyzing overlay */}
          {status === "analyzing" && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "fadeIn 0.3s ease", zIndex: 5,
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 48, height: 48,
                  border: "3px solid rgba(232,168,56,0.2)", borderTopColor: "#E8A838",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                  margin: "0 auto 16px",
                }} />
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Analyzing with Google Vision...</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>Identifying product, brand, and labels</div>
              </div>
            </div>
          )}

          {/* Capture button */}
          <div style={{
            position: "absolute", bottom: 48,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          }}>
            <button
              onClick={captureAndAnalyze}
              disabled={!cameraReady || scanning}
              style={{
                width: 72, height: 72, borderRadius: "50%",
                background: !cameraReady
                  ? "rgba(255,255,255,0.2)"
                  : scanning
                  ? "rgba(232,168,56,0.5)"
                  : "linear-gradient(135deg, #E8A838, #F0C05A)",
                border: "4px solid rgba(255,255,255,0.3)",
                cursor: cameraReady && !scanning ? "pointer" : "default",
                boxShadow: cameraReady ? "0 0 30px rgba(232,168,56,0.4)" : "none",
                animation: scanning ? "pulse 1s ease-in-out infinite" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{
                width: scanning ? 24 : 28, height: scanning ? 24 : 28,
                borderRadius: scanning ? 4 : "50%", background: "#fff",
                transition: "all 0.2s ease",
              }} />
            </button>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
              {!cameraReady ? "Starting camera..." : scanning ? "Processing..." : "Tap to scan"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
