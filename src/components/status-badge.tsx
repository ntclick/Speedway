"use client";

import { Wifi, WifiOff, Satellite, AlertCircle, Loader2, KeyRound, Radio } from "lucide-react";

export type BadgeState =
  | "live"
  | "ipfs-only"
  | "api"
  | "error"
  | "loading"
  | "missing-credentials"
  | "info";

interface StatusBadgeProps {
  state: BadgeState;
  label?: string;
}

const BADGE_CONFIG: Record<
  BadgeState,
  { className: string; Icon: React.ElementType; defaultLabel: string; animate?: boolean }
> = {
  live: {
    className: "badge badge-live",
    Icon: Satellite,
    defaultLabel: "Live",
  },
  "ipfs-only": {
    className: "badge badge-ipfs",
    Icon: Radio,
    defaultLabel: "IPFS Beacon",
  },
  api: {
    className: "badge badge-api",
    Icon: Wifi,
    defaultLabel: "API",
  },
  error: {
    className: "badge badge-error",
    Icon: AlertCircle,
    defaultLabel: "Error",
  },
  loading: {
    className: "badge badge-loading",
    Icon: Loader2,
    defaultLabel: "Loading",
    animate: true,
  },
  "missing-credentials": {
    className: "badge badge-info",
    Icon: KeyRound,
    defaultLabel: "No Credentials",
  },
  info: {
    className: "badge badge-info",
    Icon: WifiOff,
    defaultLabel: "Info",
  },
};

export function StatusBadge({ state, label }: StatusBadgeProps) {
  const { className, Icon, defaultLabel, animate } = BADGE_CONFIG[state];

  return (
    <span className={className}>
      <Icon
        size={10}
        style={animate ? { animation: "spin-slow 1s linear infinite" } : undefined}
      />
      {label ?? defaultLabel}
    </span>
  );
}
