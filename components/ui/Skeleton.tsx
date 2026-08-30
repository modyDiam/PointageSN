"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
  ...props
}) => {
  const variantStyles: Record<string, string> = {
    text: "h-3 w-full rounded-md",
    circular: "rounded-full aspect-square",
    rectangular: "rounded-xl",
    card: "h-24 w-full rounded-2xl",
  };

  return (
    <div
      className={`bg-slate-200/80 animate-pulse ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
};
