"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CopyButton } from "./copy-button";

interface RawJsonViewerProps {
  data: unknown;
  label?: string;
  defaultOpen?: boolean;
  maxHeight?: string;
}

export function RawJsonViewer({
  data,
  label = "Raw Response",
  defaultOpen = false,
  maxHeight = "320px",
}: RawJsonViewerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const json = JSON.stringify(data, null, 2);

  return (
    <div
      style={{
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen((o) => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.65rem 1rem",
          background: "var(--bg-surface)",
          border: "none",
          cursor: "pointer",
          color: "var(--text-secondary)",
          fontSize: "0.8rem",
          fontWeight: 500,
          userSelect: "none",
          outline: "none",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          {label}
        </span>
        <div onClick={(e) => e.stopPropagation()}>
          <CopyButton text={json} label="JSON" size="sm" />
        </div>
      </div>

      {/* Content */}
      {open && (
        <div
          className="code-block animate-fade-in"
          style={{
            maxHeight,
            overflowY: "auto",
            borderRadius: 0,
            borderTop: "1px solid var(--border-subtle)",
            margin: 0,
          }}
        >
          <pre style={{ margin: 0 }}>{json}</pre>
        </div>
      )}
    </div>
  );
}
