"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: "success" | "info" | "warning";
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  onClose,
  duration = 3200,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200); // Allow fade-out animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      border: "border-emerald-200/90",
      dot: "bg-emerald-500",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
      badge: "bg-emerald-50 text-emerald-800",
    },
    info: {
      border: "border-blue-200/90",
      dot: "bg-brand-600",
      icon: <Info className="w-4 h-4 text-brand-600 shrink-0" />,
      badge: "bg-blue-50 text-brand-800",
    },
    warning: {
      border: "border-amber-200/90",
      dot: "bg-amber-500",
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
      badge: "bg-amber-50 text-amber-800",
    },
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-4 right-4 sm:top-5 sm:right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border ${
        styles[type].border
      } shadow-modal transition-all duration-200 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-2 scale-95"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {styles[type].icon}
        <p className="text-xs font-bold text-slate-900 truncate">{message}</p>
      </div>

      <button
        type="button"
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 150);
        }}
        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
        aria-label="Fermer la notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
