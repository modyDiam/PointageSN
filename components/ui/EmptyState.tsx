"use client";

import React from "react";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mx-auto">
        {icon}
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-slate-900">
          {title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>

      {(action || secondaryAction) && (
        <div className="flex items-center justify-center gap-2.5 flex-wrap pt-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
