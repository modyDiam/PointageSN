"use client";

import React, { useEffect } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

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

  const styles = {
    success: {
      bg: "bg-white border-emerald-200 text-slate-800 shadow-lg shadow-emerald-500/10",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    info: {
      bg: "bg-white border-blue-200 text-slate-800 shadow-lg shadow-blue-500/10",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
    warning: {
      bg: "bg-white border-amber-200 text-slate-800 shadow-lg shadow-amber-500/10",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md transition-all duration-300 animate-fade-in ${styles[type].bg}`}
    >
      {styles[type].icon}
      <p className="text-sm font-medium text-slate-800">{message}</p>
      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors ml-2"
        aria-label="Fermer la notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
