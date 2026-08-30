"use client";

import React, { useEffect } from "react";
import { CheckCircle2, Info, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "info" | "warning";
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: "bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-900/30",
    info: "bg-cyan-950/90 border-cyan-500/50 text-cyan-100 shadow-cyan-900/30",
    warning: "bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-900/30",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />,
    warning: <Info className="w-5 h-5 text-amber-400 shrink-0" />,
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 animate-fade-in ${bgColors[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
        aria-label="Fermer la notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
