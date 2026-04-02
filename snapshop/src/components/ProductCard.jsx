import React, { useState } from 'react';

export default function ProductCard({ product, index }) {
  const [expanded, setExpanded] = useState(false);
  const savings = (product.originalPrice && product.originalPrice > product.price)
    ? Math.round((product.originalPrice - product.price) * 100) / 100
    : 0;

  return (
    <div
      style={{
        background: expanded ? "rgba(232,168,56,0.06)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${expanded ? "rgba(232,168,56,0.2)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 16, padding: 20, cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        animation: `slideUp 0.5s ease-out ${index * 0.1}s both`,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 12,
          background: "rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, flexShrink: 0,
        }}>🛒</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 3,
                overflow: "hidden", textOverflow: "ellipsis",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>{product.name}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{product.store}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#E8A838" }}>${product.price}</div>
              {savings > 0 && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "line-through" }}>
                  ${product.originalPrice}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {savings > 0 && (
              <span style={{
                fontSize: 10, padding: "2px 7px", borderRadius: 5,
                background: "rgba(76,209,112,0.15)", color: "#4CD170", fontWeight: 600,
              }}>Save ${savings.toFixed(0)}</span>
            )}
            {product.rating && (
              <span style={{
                fontSize: 10, padding: "2px 7px", borderRadius: 5,
                background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)",
              }}>
                ★ {product.rating}
                {product.reviews ? ` (${product.reviews >= 1000 ? (product.reviews / 1000).toFixed(1) + "k" : product.reviews})` : ""}
              </span>
            )}
            {product.inStock === false && (
              <span style={{
                fontSize: 10, padding: "2px 7px", borderRadius: 5,
                background: "rgba(255,80,80,0.15)", color: "#FF5050", fontWeight: 600,
              }}>Out of Stock</span>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{
          marginTop: 16, paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
            Purchasing through SnapShop supports the app at no extra cost to you.
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (product.url) window.open(product.url, "_blank", "noopener");
            }}
            style={{
              width: "100%", padding: "12px 0", borderRadius: 10,
              background: product.inStock === false
                ? "rgba(255,255,255,0.06)"
                : "linear-gradient(135deg, #E8A838, #F0C05A)",
              border: "none",
              color: product.inStock === false ? "rgba(255,255,255,0.4)" : "#1A1200",
              fontWeight: 700, fontSize: 14,
              cursor: product.inStock === false ? "default" : "pointer",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {product.inStock === false ? "Out of Stock" : `Buy Now on ${product.store}`}
          </button>
        </div>
      )}
    </div>
  );
}
