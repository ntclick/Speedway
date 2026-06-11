"use client";

import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

export function CopyButton({
  text,
  label = "Copy",
  size = "sm",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  const iconSize = size === "sm" ? 12 : 14;
  const fontSize = size === "sm" ? "0.75rem" : "0.85rem";

  return (
    <button
      onClick={handleCopy}
      className={`btn-secondary ${className}`}
      style={{ fontSize, padding: size === "sm" ? "0.3rem 0.7rem" : undefined }}
      title={copied ? "Copied!" : `Copy ${label}`}
    >
      {copied ? (
        <>
          <Check size={iconSize} style={{ color: "var(--text-success)" }} />
          <span style={{ color: "var(--text-success)" }}>Copied!</span>
        </>
      ) : (
        <>
          <Copy size={iconSize} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
