import React from 'react';
import { Users, Award, ShieldCheck, UserX } from 'lucide-react';
import { PassengerSummaryStats } from '../types/passenger';

export interface PassengerSummaryProps {
  summary: PassengerSummaryStats | null;
  isLoading?: boolean;
}

export const PassengerSummary: React.FC<PassengerSummaryProps> = ({
  summary,
  isLoading = false,
}) => {
  const totalPassengers = summary?.totalPassengers ?? 0;
  const activePassengers = summary?.activePassengers ?? 0;
  const inactiveOrSuspended = (summary?.inactivePassengers ?? 0) + (summary?.suspendedPassengers ?? 0);
  const totalPoints = (summary?.totalPoints ?? 0).toLocaleString('en-US');

  const cards = [
    {
      label: 'Total Passengers',
      value: totalPassengers,
      icon: Users,
      subtext: 'Registered loyalty members',
    },
    {
      label: 'Active Members',
      value: activePassengers,
      icon: ShieldCheck,
      subtext: `${totalPassengers > 0 ? Math.round((activePassengers / totalPassengers) * 100) : 0}% of membership`,
    },
    {
      label: 'Inactive / Suspended',
      value: inactiveOrSuspended,
      icon: UserX,
      subtext: 'Requires floor staff attention',
    },
    {
      label: 'Total Points',
      value: totalPoints,
      icon: Award,
      subtext: 'Cumulative frequent flyer miles',
    },
  ];

  return (
    <section aria-labelledby="summary-heading" className="w-full">
      <h2 id="summary-heading" className="sr-only">Passenger Summary</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-neutral-200 rounded-lg p-5 shadow-sm transition-shadow hover:shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {card.label}
                </span>
                <div className="p-2 bg-neutral-100 rounded-md text-neutral-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-3">
                {isLoading ? (
                  <div className="h-8 w-24 bg-neutral-200 animate-pulse rounded" />
                ) : (
                  <span className="text-2xl font-bold tracking-tight text-neutral-900">
                    {card.value}
                  </span>
                )}
                <p className="mt-1 text-xs text-neutral-500">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {summary && (
        <div className="mt-4 p-4 bg-white border border-neutral-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
          <span className="font-semibold text-neutral-700">Tier Distribution:</span>
          <div className="flex flex-wrap gap-4 text-neutral-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-400" />
              Bronze: <strong className="text-neutral-900">{summary.tierCounts?.Bronze ?? 0}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-600" />
              Silver: <strong className="text-neutral-900">{summary.tierCounts?.Silver ?? 0}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-800" />
              Gold: <strong className="text-neutral-900">{summary.tierCounts?.Gold ?? 0}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-950" />
              Platinum: <strong className="text-neutral-900">{summary.tierCounts?.Platinum ?? 0}</strong>
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
