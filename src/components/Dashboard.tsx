import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plane } from 'lucide-react';
import { Passenger, PassengerFormData, PassengerSummaryStats } from '../types/passenger';
import { PassengerService, defaultPassengerService } from '../services/passengerService';
import { trackUserInteraction } from '../services/analytics';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorBanner } from './ErrorBanner';
import { PassengerSummary } from './PassengerSummary';
import { PassengerTable } from './PassengerTable';
import { PassengerFormModal } from './PassengerFormModal';

export interface DashboardProps {
  passengerService?: PassengerService;
}

export const Dashboard: React.FC<DashboardProps> = ({
  passengerService = defaultPassengerService,
}) => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [summary, setSummary] = useState<PassengerSummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isUsingStorageFallback, setIsUsingStorageFallback] = useState<boolean>(
    () => passengerService.isUsingFallback()
  );

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Monitor connectivity status
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch passengers and summary stats
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedPassengers, fetchedSummary] = await Promise.all([
        passengerService.getAll(),
        passengerService.getSummary(),
      ]);
      setPassengers(fetchedPassengers);
      setSummary(fetchedSummary);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Connection timeout. Failed to load passenger records.';
      setError(errorMsg);
    } finally {
      setIsUsingStorageFallback(passengerService.isUsingFallback());
      setIsLoading(false);
    }
  }, [passengerService]);

  // Initial data load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Search and filter handler
  const handleFilterChange = useCallback(
    async (query: string, tier: string, status: string) => {
      setIsLoading(true);
      setError(null);
      try {
        if (!query.trim() && !tier && !status) {
          const all = await passengerService.getAll();
          setPassengers(all);
        } else {
          const filtered = await passengerService.search(query, tier, status);
          setPassengers(filtered);
          trackUserInteraction('search_passenger', {
            query: query.trim(),
            tier: tier || undefined,
            status: status || undefined,
          });
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : 'Search operation failed.';
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [passengerService]
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    handleFilterChange(query, selectedTier, selectedStatus);
  };

  const handleTierChange = (tier: string) => {
    setSelectedTier(tier);
    handleFilterChange(searchQuery, tier, selectedStatus);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    handleFilterChange(searchQuery, selectedTier, status);
  };

  // Retry failed operation
  const handleRetry = async () => {
    trackUserInteraction('retry_operation', { timestamp: Date.now() });
    await loadData();
  };

  // Open modal for Create
  const handleOpenAddModal = () => {
    setEditingPassenger(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (passenger: Passenger) => {
    setEditingPassenger(passenger);
    setIsModalOpen(true);
  };

  // Handle Form Submit (Create or Update)
  const handleFormSubmit = async (data: PassengerFormData) => {
    setIsSubmitting(true);
    try {
      if (editingPassenger) {
        await passengerService.update(editingPassenger.id, data);
        trackUserInteraction('update_passenger', {
          id: editingPassenger.id,
        });
      } else {
        await passengerService.create(data);
        trackUserInteraction('create_passenger');
      }

      setIsModalOpen(false);
      setEditingPassenger(null);

      // Refresh list and stats
      const [all, newSummary] = await Promise.all([
        passengerService.getAll(),
        passengerService.getSummary(),
      ]);
      setPassengers(all);
      setSummary(newSummary);
      // Reset active filters
      setSearchQuery('');
      setSelectedTier('');
      setSelectedStatus('');
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to save passenger details.';
      setError(errorMsg);
    } finally {
      setIsUsingStorageFallback(passengerService.isUsingFallback());
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeletePassenger = async (passenger: Passenger) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete passenger ${passenger.fullName}? This action cannot be undone.`
    );

    if (!isConfirmed) return;

    try {
      const deleted = await passengerService.delete(passenger.id);
      setIsUsingStorageFallback(passengerService.isUsingFallback());
      if (deleted) {
        trackUserInteraction('delete_passenger', { id: passenger.id });
        const [all, newSummary] = await Promise.all([
          passengerService.getAll(),
          passengerService.getSummary(),
        ]);
        setPassengers(all);
        setSummary(newSummary);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to delete passenger.';
      setError(errorMsg);
    } finally {
      setIsUsingStorageFallback(passengerService.isUsingFallback());
    }
  };

  const existingMembershipNumbers = useMemo(
    () => passengers.map((p) => p.membershipNumber),
    [passengers]
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-neutral-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-900 text-white rounded-lg shadow-sm">
              <Plane className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                End-to-End Frequent Flyer Portal
              </h1>
              <p className="text-xs text-neutral-500 hidden sm:block">
                Airline Ground Staff Operations &amp; Loyalty Registry
              </p>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {isUsingStorageFallback && (
          <ErrorBanner
            message="Browser storage is unavailable. Changes are kept only in temporary memory and will be lost when this page is reloaded or closed."
          />
        )}

        {/* Error or Offline Banner */}
        {error ? (
          <ErrorBanner
            message={error}
            onRetry={handleRetry}
            onDismiss={() => setError(null)}
            isOffline={isOffline}
          />
        ) : isOffline ? (
          <ErrorBanner
            message="You are currently working offline. Changes are saved locally and will remain accessible on this terminal."
            isOffline={true}
          />
        ) : null}

        {/* Loading Spinner for initial fetch */}
        {isLoading && passengers.length === 0 && !error ? (
          <div className="py-16">
            <LoadingIndicator label="Loading passengers..." size="lg" />
          </div>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <PassengerSummary summary={summary} isLoading={isLoading} />

            {/* Passenger Data Table */}
            <PassengerTable
              passengers={passengers}
              isLoading={isLoading}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              selectedTier={selectedTier}
              onTierChange={handleTierChange}
              selectedStatus={selectedStatus}
              onStatusChange={handleStatusChange}
              onEdit={handleOpenEditModal}
              onDelete={handleDeletePassenger}
              onAddNew={handleOpenAddModal}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-4 px-4 text-center text-xs text-neutral-500">
        <p>Enterprise Ground Staff Portal &bull; Monochromatic Corporate System</p>
        <p className="mt-1 text-neutral-400">
          Notice: Data persistence is strictly browser-local (localStorage). This application does not provide shared multi-user storage or server synchronization.
        </p>
      </footer>

      {/* Passenger Add/Edit Modal */}
      <PassengerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPassenger(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingPassenger}
        existingMembershipNumbers={existingMembershipNumbers}
        isLoading={isSubmitting}
      />
    </div>
  );
};
