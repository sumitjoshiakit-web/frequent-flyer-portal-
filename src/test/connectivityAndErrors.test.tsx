import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorBanner } from '../components/ErrorBanner';
import { Dashboard } from '../components/Dashboard';
import { PassengerService } from '../services/passengerService';

describe('Connectivity, Loading Indicators & Error Recovery (REQ-7 & REQ-8)', () => {
  describe('LoadingIndicator Component', () => {
    it('renders with role="status" and aria-busy="true"', () => {
      render(<LoadingIndicator label="Loading passengers..." />);
      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByText('Loading passengers...')).toBeInTheDocument();
    });

    it('provides accessible hidden text for screen readers by default', () => {
      render(<LoadingIndicator />);
      const indicator = screen.getByRole('status');
      expect(indicator).toBeInTheDocument();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('ErrorBanner Component & Retry Mechanism', () => {
    it('renders error message with role="alert"', () => {
      render(<ErrorBanner message="Network connection failed. Could not load records." />);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(screen.getByText(/network connection failed/i)).toBeInTheDocument();
    });

    it('renders a Retry button when onRetry callback is provided', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(
        <ErrorBanner
          message="Failed to sync with local database."
          onRetry={onRetry}
        />
      );

      const retryBtn = screen.getByRole('button', { name: /retry/i });
      expect(retryBtn).toBeInTheDocument();

      await user.click(retryBtn);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('displays offline indicator when isOffline is true', () => {
      render(
        <ErrorBanner
          message="You are currently working offline. Changes are saved locally."
          isOffline={true}
        />
      );

      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });
  });

  describe('Dashboard Network States & Graceful Degradation', () => {
    let mockService: PassengerService;

    beforeEach(() => {
      mockService = new PassengerService();
    });

    it('shows loading indicator during initial data fetch', () => {
      // Mock getAll to remain pending
      vi.spyOn(mockService, 'getAll').mockImplementation(
        () => new Promise(() => {})
      );
      vi.spyOn(mockService, 'getSummary').mockImplementation(
        () => new Promise(() => {})
      );

      render(<Dashboard passengerService={mockService} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders error banner with retry option if service throws on initial load', async () => {
      const user = userEvent.setup();
      vi.spyOn(mockService, 'getAll').mockRejectedValue(new Error('Connection timeout'));
      vi.spyOn(mockService, 'getSummary').mockRejectedValue(new Error('Connection timeout'));

      render(<Dashboard passengerService={mockService} />);

      const errorAlert = await screen.findByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(screen.getByText(/timeout|failed/i)).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();

      // Now mock successful resolution on retry
      vi.spyOn(mockService, 'getAll').mockResolvedValue([]);
      vi.spyOn(mockService, 'getSummary').mockResolvedValue({
        totalPassengers: 0,
        activePassengers: 0,
        inactivePassengers: 0,
        suspendedPassengers: 0,
        totalPoints: 0,
        tierCounts: { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 },
      });

      await user.click(retryButton);
      expect(mockService.getAll).toHaveBeenCalled();
    });
  });
});
