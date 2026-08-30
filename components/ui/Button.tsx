"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "ghost"
    | "whatsapp";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    // Variant mapping
    const variantStyles: Record<string, string> = {
      primary:
        "bg-navy-900 hover:bg-navy-800 text-white shadow-xs focus:ring-navy-900 border border-transparent",
      secondary:
        "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs focus:ring-slate-400 hover:border-slate-300",
      success:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus:ring-emerald-600 border border-transparent",
      warning:
        "bg-amber-500 hover:bg-amber-600 text-white shadow-xs focus:ring-amber-500 border border-transparent",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-600 border border-transparent",
      ghost:
        "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-300 border border-transparent",
      whatsapp:
        "bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xs focus:ring-emerald-500 border border-transparent",
    };

    // Size mapping
    const sizeStyles: Record<string, string> = {
      xs: "px-2 py-1 text-[11px] gap-1",
      sm: "px-2.5 py-1.5 text-xs gap-1.5",
      md: "px-3.5 py-2 text-xs gap-2",
      lg: "px-5 py-2.5 text-sm gap-2.5",
      icon: "p-2 text-xs aspect-square",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
