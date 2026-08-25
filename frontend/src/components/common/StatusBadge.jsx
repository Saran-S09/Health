import React from 'react';

export const StatusBadge = ({ status, size = "md" }) => {
  const normalized = (status || "NORMAL").toUpperCase();

  let bg = "var(--status-normal-bg)";
  let border = "var(--status-normal-border)";
  let color = "#059669";
  let icon = "●";

  switch (normalized) {
    case "ATTENTION":
    case "ATTENTION REQUIRED":
      bg = "var(--status-attention-bg)";
      border = "var(--status-attention-border)";
      color = "#d97706";
      icon = "⚠";
      break;
    case "CRITICAL":
    case "CRITICAL ALERT":
      bg = "var(--status-critical-bg)";
      border = "var(--status-critical-border)";
      color = "#dc2626";
      icon = "🚨";
      break;
    case "PENDING":
      bg = "rgba(37, 99, 235, 0.1)";
      border = "rgba(37, 99, 235, 0.3)";
      color = "#2563eb";
      icon = "⏳";
      break;
    case "CONNECTED":
    case "ACCEPTED":
      bg = "rgba(16, 185, 129, 0.12)";
      border = "rgba(16, 185, 129, 0.3)";
      color = "#059669";
      icon = "✓";
      break;
    case "DECLINED":
    case "NOT CONNECTED":
      bg = "rgba(100, 116, 139, 0.12)";
      border = "rgba(100, 116, 139, 0.3)";
      color = "#475569";
      icon = "✕";
      break;
    default:
      break;
  }

  const isSmall = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? "0.25rem" : "0.35rem",
        padding: isSmall ? "0.15rem 0.45rem" : "0.3rem 0.75rem",
        fontSize: isSmall ? "0.68rem" : "0.85rem",
        fontWeight: "700",
        borderRadius: "9999px",
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: color,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        lineHeight: 1.3
      }}
    >
      <span style={{ fontSize: isSmall ? "0.6rem" : "0.75rem", lineHeight: 1 }}>{icon}</span>
      <span>{normalized}</span>
    </span>
  );
};
