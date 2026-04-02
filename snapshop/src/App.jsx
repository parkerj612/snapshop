import React, { useState, useCallback } from 'react';
import Particles from './components/Particles';
import Header from './components/Header';
import SetupScreen from './components/SetupScreen';
import ScannerOverlay from './components/ScannerOverlay';
import ProductCard from './components/ProductCard';
import { searchProducts } from './services/search';
import { storage } from './services/storage';

const QUICK_SEARCHES = [
  "AirPods Pro 2", "PS5 Slim", "Stanley Cup 40oz", "Dyson V15",
  "Nike Dunk Low", "iPad Air M2", "Kindle Paperwhite", "Lego Star Wars",
  "Samsung Galaxy S25", "JBL Flip 6", "Crocs Classic Clog", "Yeti Rambler",
];

export default function App() {
  const [screen, setScreen] = useState("home");
  const [apiKey, setApiKey] = useState(() => storage.get("apiKey") || "");
  const [results, setResults] = useState([]);
  const [productName, setProductName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [error, setError] = useState(null);
  const [scanHistory, setScanHistory] = useState(() => storage.get("history") || []);

  const saveApiKey = (key) => {
    setApiKey(key);
    storage.set("apiKey", key);
    setScreen("home");
  };

  const doProductSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setProductName(query);
    setResults([]);
    setScreen("results");

    try {
      const data = await searchProducts(query);
      setResults(data.results || []);
      setProductName(data.productName || query);

      const entry = { query, time: Date.now(), resultCount: (data.results || []).length };
      const newHistory = [entry, ...scanHistory].slice(0, 30);
      setScanHistory(newHistory);
      storage.set("history", newHistory);
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed: " + err.message);
      setResults([]);
    }
    setSearching(false);
  }, [scanHistory]);

  const handleCapture = useCallback((data) => {
    setScanData(data);
    if (data.error) {
      setError(data.error);
      setScreen("results");
      setResults([]);
      setSearching(false);
      return;
    }
    doProductSearch(data.query);
  }, [doProductSearch]);

  const handleSearch = () => {
    if (searchQuery.trim()) doProductSearch(searchQuery.trim());
  };

  // ─── Setup Screen ───
  if (!apiKey) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0B08", fontFamily: "'Outfit', sans-serif", color: "#fff", maxWidth: 430, margin: "0 auto" }}>
        <div style={{ padding: "20px 20px 0", textAlign: "center" }}>
          <div style={{
            fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display', serif",
            background: "linear-gradient(135deg, #E8A838, #F0C05A)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>SnapShop</div>
        </div>
        <SetupScreen onSave={saveApiKey} savedKey="" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0D0B08",
      fontFamily: "'Outfit', sans-serif", color: "#fff",
      maxWidth: 430, margin: "0 auto", position: "relative", overflow: "hidden",
    }}>
      <Particles />

      {screen === "scanning" && (
        <ScannerOverlay
          onCapture={handleCapture}
          onClose={() => setScreen("home")}
          apiKey={apiKey}
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        <Header
          screen={screen}
          onNavigate={(s) => { setScreen(s); setError(null); }}
          onSettings={() => { setApiKey(""); storage.remove("apiKey"); }}
        />

        <div style={{ padding: "20px 20px 100px" }}>

          {/* ═══════ HOME ═══════ */}
          {screen === "home" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Search bar */}
              <div style={{ display: "flex", gap: 8, animation: "slideUp 0.3s ease-out" }}>
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.06)", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.08)", padding: "0 14px",
                }}>
                  <span style={{ fontSize: 16, opacity: 0.4 }}>🔍</span>
                  <input
                    type="text" placeholder="Search any product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    style={{
                      flex: 1, background: "none", border: "none", color: "#fff",
                      fontSize: 14, padding: "12px 0", outline: "none",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  />
                </div>
                <button onClick={handleSearch} style={{
                  background: searchQuery.trim() ? "linear-gradient(135deg, #E8A838, #F0C05A)" : "rgba(255,255,255,0.06)",
                  border: searchQuery.trim() ? "none" : "1px solid rgba(255,255,255,0.08)",
                  color: searchQuery.trim() ? "#1A1200" : "#fff",
                  borderRadius: 12, width: 48, cursor: "pointer", fontSize: 16, fontWeight: 700,
                }}>→</button>
              </div>

              {/* Scan hero */}
              <button onClick={() => setScreen("scanning")} style={{
                background: "linear-gradient(135deg, rgba(232,168,56,0.12), rgba(240,192,90,0.06))",
                border: "1px solid rgba(232,168,56,0.2)", borderRadius: 24,
                padding: "40px 20px", cursor: "pointer", textAlign: "center",
                animation: "scanGlow 3s ease-in-out infinite", transition: "all 0.3s ease",
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%", margin: "0 auto 16px",
                  background: "linear-gradient(135deg, #E8A838, #F0C05A)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36,
                  boxShadow: "0 8px 32px rgba(232,168,56,0.3)",
                }}>📷</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Scan a Product</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                  {apiKey === "DEMO_MODE"
                    ? "Demo mode — add API key in settings for real scanning"
                    : "Point your camera at any item to identify & compare prices"
                  }
                </div>
              </button>

              {/* Status indicators */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                background: "rgba(255,255,255,0.03)", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: apiKey === "DEMO_MODE" ? "#FFB400" : "#4CD170" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  Vision: {apiKey === "DEMO_MODE" ? "Demo" : "Connected"}
                </span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginLeft: "auto" }}>
                  Product Search: Active
                </span>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4CD170" }} />
              </div>

              {/* Quick search chips */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "rgba(255,255,255,0.7)" }}>Quick Search</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {QUICK_SEARCHES.map(q => (
                    <button key={q} onClick={() => doProductSearch(q)} style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 20, padding: "7px 14px",
                      color: "rgba(255,255,255,0.65)", fontSize: 12,
                      cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                      transition: "all 0.2s ease",
                    }}>{q}</button>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "rgba(255,255,255,0.7)" }}>How It Works</div>
                {[
                  { icon: "📸", title: "Scan or Search", desc: "Camera uses Google Vision AI, or type any product name" },
                  { icon: "🤖", title: "AI Price Comparison", desc: "Searches the web in real-time for current prices" },
                  { icon: "💸", title: "Buy at Best Price", desc: "Purchase through SnapShop — we earn affiliate commission" },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 14, alignItems: "center", padding: "12px 14px", marginBottom: 8,
                    background: "rgba(255,255,255,0.03)", borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.05)",
                    animation: `slideUp 0.5s ease-out ${0.1 * i}s both`,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "rgba(232,168,56,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, flexShrink: 0,
                    }}>{s.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ RESULTS ═══════ */}
          {screen === "results" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Vision detection badge */}
              {scanData?.visionData && (
                <div style={{
                  background: "rgba(91,156,245,0.08)",
                  border: "1px solid rgba(91,156,245,0.15)",
                  borderRadius: 12, padding: "10px 14px", animation: "slideUp 0.3s ease-out",
                }}>
                  <div style={{ fontSize: 10, color: "#5B9CF5", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                    Google Vision Detected
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                    {scanData.visionData.bestGuess || scanData.query}
                  </div>
                  {scanData.visionData.labels?.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                      {scanData.visionData.labels.slice(0, 5).map((l, i) => (
                        <span key={i} style={{
                          fontSize: 10, padding: "2px 6px", borderRadius: 4,
                          background: "rgba(91,156,245,0.1)", color: "rgba(255,255,255,0.5)",
                        }}>{l}</span>
                      ))}
                    </div>
                  )}
                  {scanData.thumbnail && (
                    <img src={scanData.thumbnail} alt="" style={{
                      marginTop: 8, width: "100%", height: 120, objectFit: "cover",
                      borderRadius: 8, opacity: 0.7,
                    }} />
                  )}
                </div>
              )}

              {/* Results header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{productName || "Search Results"}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    {searching ? "Searching retailers..." : `${results.length} results found`}
                  </div>
                </div>
                <button onClick={() => setScreen("scanning")} style={{
                  background: "linear-gradient(135deg, #E8A838, #F0C05A)",
                  border: "none", color: "#1A1200", borderRadius: 10,
                  padding: "8px 14px", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                }}>Scan Again</button>
              </div>

              {/* Loading */}
              {searching && (
                <div style={{ padding: "40px 0", textAlign: "center", animation: "fadeIn 0.3s ease" }}>
                  <div style={{
                    width: 40, height: 40,
                    border: "3px solid rgba(232,168,56,0.2)", borderTopColor: "#E8A838",
                    borderRadius: "50%", animation: "spin 0.8s linear infinite",
                    margin: "0 auto 16px",
                  }} />
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Searching the web for prices...</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Comparing across major retailers</div>
                </div>
              )}

              {/* Error */}
              {error && !searching && (
                <div style={{
                  background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.15)",
                  borderRadius: 12, padding: 16, textAlign: "center",
                }}>
                  <div style={{ fontSize: 14, color: "#FF5050", marginBottom: 6 }}>Something went wrong</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>{error}</div>
                  <button onClick={() => doProductSearch(productName || searchQuery)} style={{
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff", borderRadius: 8, padding: "8px 20px",
                    fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                  }}>Retry</button>
                </div>
              )}

              {/* Best deal */}
              {!searching && results.length > 0 && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(232,168,56,0.12), rgba(240,192,90,0.06))",
                  border: "1px solid rgba(232,168,56,0.25)", borderRadius: 16, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 10, animation: "slideUp 0.4s ease-out",
                }}>
                  <span style={{ fontSize: 20 }}>🏆</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#E8A838" }}>BEST PRICE FOUND</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                      {results[0].name} — ${results[0].price} at {results[0].store}
                    </div>
                  </div>
                </div>
              )}

              {/* Product cards */}
              {!searching && results.map((product, i) => (
                <ProductCard key={i} product={product} index={i} />
              ))}

              {/* Search again from results */}
              {!searching && (
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <div style={{
                    flex: 1, display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,0.06)", borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.08)", padding: "0 14px",
                  }}>
                    <input
                      type="text" placeholder="Search another product..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      style={{
                        flex: 1, background: "none", border: "none", color: "#fff",
                        fontSize: 13, padding: "11px 0", outline: "none",
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    />
                  </div>
                  <button onClick={handleSearch} style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff", borderRadius: 12, width: 44,
                    cursor: "pointer", fontSize: 14,
                  }}>→</button>
                </div>
              )}

              <button onClick={() => { setScreen("home"); setError(null); setScanData(null); }} style={{
                background: "none", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)", borderRadius: 12, padding: "12px 0",
                fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              }}>← Back to Home</button>
            </div>
          )}

          {/* ═══════ HISTORY ═══════ */}
          {screen === "history" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Scan History</div>
                {scanHistory.length > 0 && (
                  <button onClick={() => { setScanHistory([]); storage.remove("history"); }} style={{
                    background: "none", border: "1px solid rgba(255,80,80,0.2)",
                    color: "rgba(255,80,80,0.6)", borderRadius: 8, padding: "6px 12px",
                    fontSize: 11, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                  }}>Clear All</button>
                )}
              </div>

              {scanHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                  No scans yet — try scanning or searching for a product!
                </div>
              ) : (
                scanHistory.map((entry, i) => (
                  <button key={i} onClick={() => doProductSearch(entry.query)} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12, padding: "12px 16px", cursor: "pointer",
                    textAlign: "left", fontFamily: "'Outfit', sans-serif",
                    color: "#fff", width: "100%",
                    animation: `slideUp 0.4s ease-out ${i * 0.04}s both`,
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{entry.query}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                        {entry.resultCount} results · {new Date(entry.time).toLocaleDateString()} {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}>→</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
