import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, X } from 'lucide-react';

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  isOffline?: boolean;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  onDismiss,
  isOffline = false,
}) => {
  return (
    <div
      role="alert"
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-neutral-900 text-neutral-50 border border-neutral-700 rounded-lg shadow-sm"
    >
      <div className="flex items-center gap-3">
        {isOffline ? (
          <WifiOff className="h-5 w-5 text-neutral-300 flex-shrink-0" aria-hidden="true" />
        ) : (
          <AlertCircle className="h-5 w-5 text-neutral-300 flex-shrink-0" aria-hidden="true" />
        )}
        <div>
          {isOffline && !message.toLowerCase().includes('offline') && (
            <span className="inline-block px-2 py-0.5 mb-1 sm:mb-0 sm:mr-2 text-xs font-semibold uppercase tracking-wider bg-neutral-800 border border-neutral-600 rounded text-neutral-200">
              Offline
            </span>
          )}
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-100 hover:bg-white text-neutral-900 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Retry</span>
          </button>
        )}

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="p-1.5 text-neutral-400 hover:text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};
