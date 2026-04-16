"use client";

import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react";

interface VerificationResult {
  status: "verified" | "unverified" | "uncertain";
  confidence: number;
  summary?: string;
  sources?: string[];
  recommended_action?: string;
}

export default function VerificationCard({ result }: { result: Record<string, unknown> }) {
  const r = result as unknown as VerificationResult;
  if (!r?.status) return null;

  const statusConfig = {
    verified: {
      icon: CheckCircle2,
      badge: "badge-verified",
      label: "Verified",
      barColor: "bg-za-green",
    },
    unverified: {
      icon: XCircle,
      badge: "badge-unverified",
      label: "Unverified",
      barColor: "bg-red-500",
    },
    uncertain: {
      icon: AlertCircle,
      badge: "badge-uncertain",
      label: "Uncertain",
      barColor: "bg-za-gold",
    },
  };

  const config = statusConfig[r.status] ?? statusConfig.uncertain;
  const Icon = config.icon;
  const confidence = Math.round((r.confidence ?? 0) * 100);

  return (
    <div className="card w-full animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className={config.badge}>
          <Icon className="w-3 h-3" />
          {config.label}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-muted)]">Confidence</span>
          <span className="text-xs font-bold text-white">{confidence}%</span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="w-full h-1.5 bg-surface-3 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${config.barColor}`}
          style={{ width: `${confidence}%` }}
        />
      </div>

      {/* Sources */}
      {r.sources && r.sources.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-[var(--color-muted)] mb-1.5 font-semibold uppercase tracking-wide">
            Sources
          </p>
          <div className="flex flex-wrap gap-2">
            {r.sources.map((src) => (
              <span
                key={src}
                className="inline-flex items-center gap-1 text-xs bg-surface-3 border border-surface-border text-[var(--color-muted)] px-2 py-0.5 rounded-lg"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                {src}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended action */}
      {r.recommended_action && (
        <div className="bg-surface-2 rounded-xl p-3">
          <p className="text-xs font-semibold text-[var(--color-muted)] mb-1 uppercase tracking-wide">
            Recommended Action
          </p>
          <p className="text-xs text-white leading-relaxed">{r.recommended_action}</p>
        </div>
      )}
    </div>
  );
}
