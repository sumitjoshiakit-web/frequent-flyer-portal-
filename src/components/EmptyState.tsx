import React from 'react';
import { Users, Plus } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data found',
  description = 'No passenger records match your current criteria.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-dashed border-neutral-300 rounded-lg">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-neutral-100 text-neutral-600">
        <Users className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
