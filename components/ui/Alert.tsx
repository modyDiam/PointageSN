"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export interface AlertProps {
  variant?: "primary" | "success" | "warning" | "danger" | "neutral";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "primary",
  title,
  children,
  onClose,
  className = "",
}) => {
  const variantStyles: Record<string, { bg: string; border: string; text: string; icon: any }> = {
    primary: {
      bg: "bg-blue-50/80",
      border: "border-blue-200",
      text: "text-brand-900",
      icon: Info,
    },
    success: {
      bg: "bg-emerald-50/80",
      border: "border-emerald-200",
      text: "text-emerald-900",
      icon: CheckCircle2,
    },
    warning: {
      bg: "bg-amber-50/80",
      border: "border-amber-200",
      text: "text-amber-900",
      icon: AlertTriangle,
    },
    danger: {
      bg: "bg-rose-50/80",
      border: "border-rose-200",
      text: "text-rose-900",
      icon: AlertCircle,
    },
    neutral: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      text: "text-slate-900",
      icon: Info,
    },
  };

  const current = variantStyles[variant];
  const Icon = current.icon;

  return (
    <div
      className={`rounded-2xl border p-3.5 sm:p-4 flex items-start gap-3 ${current.bg} ${current.border} ${className}`}
    >
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${current.text}`} />

      <div className="min-w-0 flex-1 text-xs">
        {title && <h4 className={`font-bold ${current.text}`}>{title}</h4>}
        <div className="text-slate-600 mt-0.5 leading-relaxed">{children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
          aria-label="Fermer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
