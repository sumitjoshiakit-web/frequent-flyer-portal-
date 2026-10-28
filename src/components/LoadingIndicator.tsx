import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingIndicatorProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  label,
  size = 'md',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-7 w-7',
    lg: 'h-10 w-10',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center py-8 gap-3 text-neutral-600';

  return (
    <div
      role="status"
      aria-busy="true"
      className={containerClasses}
    >
      <Loader2
        className={`animate-spin text-neutral-800 ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      {label ? (
        <span className="text-sm font-medium text-neutral-700">{label}</span>
      ) : (
        <span className="sr-only">Loading...</span>
      )}
    </div>
  );
};
