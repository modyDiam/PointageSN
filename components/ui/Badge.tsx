"use client";

import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "primary" | "neutral" | "outline";
  size?: "xs" | "sm" | "md";
  dot?: boolean;
  dotPulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "neutral",
  size = "xs",
  dot = false,
  dotPulse = false,
  children,
  ...props
}) => {
  const variantStyles: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-200/80 font-bold",
    warning: "bg-amber-50 text-amber-800 border-amber-200/80 font-bold",
    danger: "bg-rose-50 text-rose-800 border-rose-200/80 font-bold",
    primary: "bg-blue-50 text-brand-700 border-blue-200/80 font-bold",
    neutral: "bg-slate-100 text-slate-700 border-slate-200/80 font-semibold",
    outline: "bg-white text-slate-700 border-slate-200 font-medium",
  };

  const dotColors: Record<string, string> = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    primary: "bg-brand-600",
    neutral: "bg-slate-400",
    outline: "bg-slate-400",
  };

  const sizeStyles: Record<string, string> = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1",
    sm: "text-xs px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border leading-none shrink-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]} ${
            dotPulse ? "animate-pulse-subtle" : ""
          }`}
        />
      )}
      {children}
    </span>
  );
};
