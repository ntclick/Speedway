"use client";

import { AlertTriangle, Key, Radio, Satellite } from "lucide-react";
import { CopyButton } from "./copy-button";
import { StatusBadge } from "./status-badge";
import type { ParsedRandom } from "@/lib/parse-random";

interface ProofPanelProps {
  parsed?: ParsedRandom;
  mode?: "api-or-ipfs" | "ipfs-only";
}

function Row({ label, value, mono = true }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "130px 1fr",
        gap: "0.5rem",
        alignItems: "start",
        padding: "0.5rem 0",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <span className="label" style={{ paddingTop: 2 }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: mono ? '"JetBrains Mono", monospace' : undefined,
          fontSize: "0.82rem",
          color: "var(--text-primary)",
          wordBreak: "break-all",
          lineHeight: 1.5,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function ProofPanel({ parsed, mode }: ProofPanelProps) {
  if (!parsed) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
        <Radio size={28} style={{ color: "var(--text-muted)", margin: "0 auto 0.75rem" }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Generate randomness to see proof metadata here.
        </p>
      </div>
    );
  }

  const isIpfsOnly = mode === "ipfs-only";
  const hasSignature = !!parsed.signature?.value;

  return (
    <div className="card animate-slide-up">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Satellite size={16} style={{ color: "var(--accent-cyan)" }} />
          <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Proof Panel</span>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {mode && (
            <StatusBadge
              state={isIpfsOnly ? "ipfs-only" : "api"}
              label={isIpfsOnly ? "IPFS Mode" : "API Mode"}
            />
          )}
          {parsed.source && (
            <StatusBadge state="live" label={parsed.source} />
          )}
        </div>
      </div>

      {/* Rows */}
      <div>
        <Row label="Random Hex" value={parsed.randomHex} />
        <Row label="Source" value={parsed.source} mono={false} />
        <Row label="Service" value={parsed.service} mono={false} />
        <Row
          label="Timestamp"
          value={
            parsed.timestamp
              ? typeof parsed.timestamp === "string"
                ? parsed.timestamp
                : new Date(Number(parsed.timestamp)).toISOString()
              : undefined
          }
          mono={false}
        />
        <Row label="Request ID" value={parsed.requestId} />
        <Row label="Provider" value={parsed.provider} mono={false} />
        {hasSignature && (
          <>
            <Row label="Sig. Value" value={parsed.signature?.value} />
            <Row label="Sig. PubKey" value={parsed.signature?.pk} />
            {parsed.ctrngVerified ? (
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(0, 229, 160, 0.04)", border: "1px solid rgba(0, 229, 160, 0.2)", borderRadius: 6, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e5a0" }} />
                  <span style={{ fontSize: "0.82rem", color: "var(--text-success)", fontWeight: 700 }}>
                    🛡️ Satellite Attestation Proof Verified
                  </span>
                </div>
                <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  The cryptographic signature has been verified against the satellite's public key, proving the seed was generated inside SpaceComputer's orbital enclave.
                </span>
              </div>
            ) : (
              <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(255, 77, 106, 0.04)", border: "1px solid rgba(255, 77, 106, 0.2)", borderRadius: 6, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffb800" }} />
                  <span style={{ fontSize: "0.82rem", color: "var(--text-warning)", fontWeight: 700 }}>
                    ⚠️ Satellite Attestation Unverified
                  </span>
                </div>
                <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                  {parsed.ctrngVerificationError || "The satellite signature attestation is received but could not be verified locally."}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* IPFS warning */}
      {isIpfsOnly && (
        <div className="warning-box" style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            Running in IPFS beacon mode. No API signature available. Set{" "}
            <code style={{ fontFamily: "monospace" }}>ORBITPORT_CLIENT_ID</code> and{" "}
            <code style={{ fontFamily: "monospace" }}>ORBITPORT_CLIENT_SECRET</code> to enable
            credential mode.
          </span>
        </div>
      )}

      {/* No signature note */}
      {!isIpfsOnly && !hasSignature && (
        <div className="info-box" style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
          <Key size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            No satellite signature returned (source: <code style={{ fontFamily: "monospace" }}>{parsed.source || "derived"}</code>). This is normal for derived entropy or IPFS beacon requests, which are still physically and provably random but lack direct enclave attestation signatures.
          </span>
        </div>
      )}

      {/* Copy hex */}
      <div style={{ marginTop: "1rem" }}>
        <CopyButton text={parsed.randomHex} label="Copy Hex" size="md" />
      </div>
    </div>
  );
}
