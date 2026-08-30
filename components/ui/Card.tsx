"use client";

import React, { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hoverEffect = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden ${
          hoverEffect ? "hover:shadow-sm hover:border-slate-300 transition-all" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div
      className={`px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <h3
      className={`font-bold text-xs sm:text-sm text-slate-900 leading-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<
  React.HTMLAttributes<HTMLParagraphElement>
> = ({ className = "", children, ...props }) => {
  return (
    <p className={`text-[11px] text-slate-500 mt-0.5 leading-normal ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={`p-4 sm:p-5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div
      className={`px-4 py-3 sm:px-5 sm:py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
