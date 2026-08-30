"use client";

import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-slate-700"
          >
            {label} {required && <span className="text-rose-600">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            className={`w-full bg-slate-50 border rounded-xl py-2 text-xs text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? "pl-9" : "pl-3"
            } ${rightIcon ? "pr-9" : "pr-3"} ${
              error
                ? "border-rose-400 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
                : "border-slate-200/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[10px] text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = "",
      label,
      error,
      helperText,
      disabled,
      required,
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold text-slate-700"
          >
            {label} {required && <span className="text-rose-600">*</span>}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs text-slate-900 transition-all focus:outline-none focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
            error
              ? "border-rose-400 focus:ring-1 focus:ring-rose-500 bg-rose-50/20"
              : "border-slate-200/90 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          } ${className}`}
          {...props}
        >
          {children}
        </select>

        {error ? (
          <p className="text-[11px] text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[10px] text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";
