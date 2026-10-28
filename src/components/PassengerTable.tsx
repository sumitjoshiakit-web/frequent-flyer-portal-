import React from 'react';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
import { Passenger } from '../types/passenger';
import { EmptyState } from './EmptyState';

export interface PassengerTableProps {
  passengers: Passenger[];
  isLoading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTier: string;
  onTierChange: (tier: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onEdit: (passenger: Passenger) => void;
  onDelete: (passenger: Passenger) => void;
  onAddNew: () => void;
}

export const PassengerTable: React.FC<PassengerTableProps> = ({
  passengers,
  searchQuery,
  onSearchChange,
  selectedTier,
  onTierChange,
  selectedStatus,
  onStatusChange,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  return (
    <div className="w-full bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
      {/* Controls Header: Search & Filters */}
      <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <label htmlFor="search-passengers" className="sr-only">
              Search passengers
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Search className="h-4 w-4" aria-hidden="true" />
            </div>
            <input
              id="search-passengers"
              type="text"
              role="textbox"
              aria-label="Search passengers"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, email, or membership #..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-300 rounded-md placeholder-neutral-400 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 transition-colors"
            />
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-tier" className="sr-only">
              Loyalty Level
            </label>
            <div className="relative">
              <select
                id="filter-tier"
                aria-label="Loyalty Level"
                value={selectedTier}
                onChange={(e) => onTierChange(e.target.value)}
                className="w-full sm:w-auto pl-3 pr-8 py-2 text-sm bg-white border border-neutral-300 rounded-md text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-colors"
              >
                <option value="">All Tiers</option>
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>

            {/* Status Filter */}
            <label htmlFor="filter-status" className="sr-only">
              Account State
            </label>
            <div className="relative">
              <select
                id="filter-status"
                aria-label="Account State"
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-full sm:w-auto pl-3 pr-8 py-2 text-sm bg-white border border-neutral-300 rounded-md text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add Passenger Action */}
        <button
          type="button"
          onClick={onAddNew}
          aria-label="Add Passenger"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Passenger</span>
        </button>
      </div>

      {/* Table / Empty State */}
      {passengers.length === 0 ? (
        <div className="p-8">
          <EmptyState
            title="No data found"
            description={
              searchQuery || selectedTier || selectedStatus
                ? 'No frequent flyer members match your query or filters.'
                : 'No passenger records have been created yet. Click "Add Passenger" to register a member.'
            }
            actionLabel={searchQuery || selectedTier || selectedStatus ? undefined : 'Register First Member'}
            onAction={searchQuery || selectedTier || selectedStatus ? undefined : onAddNew}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-700 divide-y divide-neutral-200">
            <thead className="bg-neutral-100 text-xs uppercase font-semibold text-neutral-600 tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Full Name
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Email
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Membership #
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Tier
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Points
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {passengers.map((passenger) => (
                <tr
                  key={passenger.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-neutral-900 whitespace-nowrap">
                    {passenger.fullName}
                  </td>
                  <td className="px-5 py-4 text-neutral-600 whitespace-nowrap">
                    {passenger.email}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-neutral-800 whitespace-nowrap">
                    {passenger.membershipNumber}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-300">
                      {passenger.tier}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-neutral-900 whitespace-nowrap">
                    {passenger.points.toLocaleString('en-US')}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        passenger.status === 'Active'
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : passenger.status === 'Inactive'
                          ? 'bg-neutral-100 text-neutral-700 border-neutral-300'
                          : 'bg-neutral-200 text-neutral-800 border-neutral-400'
                      }`}
                    >
                      {passenger.status}
                    </span>
                  </td>
                  <td aria-label="Actions" className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(passenger)}
                        aria-label={`Edit ${passenger.fullName}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      >
                        <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(passenger)}
                        aria-label={`Delete ${passenger.fullName}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-100 hover:text-red-700 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
