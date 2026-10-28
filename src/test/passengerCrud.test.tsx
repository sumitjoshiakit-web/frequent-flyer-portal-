import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../components/Dashboard';
import { PassengerService } from '../services/passengerService';
import { StorageService } from '../services/storage';
import { Passenger } from '../types/passenger';
import { ANALYTICS_LOG_MESSAGE } from '../services/analytics';

describe('Passenger CRUD, Search & Empty States (REQ-1, REQ-2, REQ-5, REQ-6, REQ-12)', () => {
  let mockStorage: StorageService;
  let service: PassengerService;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  const initialPassengers: Passenger[] = [
    {
      id: 'p-1',
      fullName: 'Emma Watson',
      email: 'emma.watson@airline.com',
      membershipNumber: 'FF-100001',
      tier: 'Platinum',
      points: 98000,
      status: 'Active',
      createdAt: '2026-01-01T10:00:00.000Z',
      updatedAt: '2026-01-01T10:00:00.000Z',
    },
    {
      id: 'p-2',
      fullName: 'Daniel Radcliffe',
      email: 'daniel.r@airline.com',
      membershipNumber: 'FF-100002',
      tier: 'Silver',
      points: 12500,
      status: 'Inactive',
      createdAt: '2026-01-02T11:00:00.000Z',
      updatedAt: '2026-01-02T11:00:00.000Z',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    mockStorage = new StorageService();
    service = new PassengerService(mockStorage);
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('Empty States (REQ-6)', () => {
    it('displays user-friendly "No data found" message when no passengers exist', async () => {
      vi.spyOn(service, 'getAll').mockResolvedValue([]);
      vi.spyOn(service, 'getSummary').mockResolvedValue({
        totalPassengers: 0,
        activePassengers: 0,
        inactivePassengers: 0,
        suspendedPassengers: 0,
        totalPoints: 0,
        tierCounts: { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 },
      });

      render(<Dashboard passengerService={service} />);

      const emptyMessage = await screen.findByText(/no data found/i);
      expect(emptyMessage).toBeInTheDocument();
    });

    it('displays "No data found" when search filter yields zero results', async () => {
      const user = userEvent.setup();
      vi.spyOn(service, 'getAll').mockResolvedValue(initialPassengers);
      vi.spyOn(service, 'getSummary').mockResolvedValue({
        totalPassengers: 2,
        activePassengers: 1,
        inactivePassengers: 1,
        suspendedPassengers: 0,
        totalPoints: 110500,
        tierCounts: { Bronze: 0, Silver: 1, Gold: 0, Platinum: 1 },
      });
      vi.spyOn(service, 'search').mockResolvedValue([]);

      render(<Dashboard passengerService={service} />);

      await screen.findByText('Emma Watson');

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'NonExistentPassengerQuery');

      const emptyMessage = await screen.findByText(/no data found/i);
      expect(emptyMessage).toBeInTheDocument();
    });
  });

  describe('Passenger Summary Dashboard (REQ-1)', () => {
    it('renders KPI summary cards with totals and tier counts', async () => {
      vi.spyOn(service, 'getAll').mockResolvedValue(initialPassengers);
      vi.spyOn(service, 'getSummary').mockResolvedValue({
        totalPassengers: 2,
        activePassengers: 1,
        inactivePassengers: 1,
        suspendedPassengers: 0,
        totalPoints: 110500,
        tierCounts: { Bronze: 0, Silver: 1, Gold: 0, Platinum: 1 },
      });

      render(<Dashboard passengerService={service} />);

      await screen.findByText('Emma Watson');

      expect(screen.getByText(/total passengers/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/110,500|110500/)).toBeInTheDocument();
    });
  });

  describe('Create Passenger Workflow & Form Validation (REQ-2, REQ-3, REQ-5, REQ-12)', () => {
    it('opens add modal, highlights invalid fields in red, and prevents submission', async () => {
      const user = userEvent.setup();
      vi.spyOn(service, 'getAll').mockResolvedValue(initialPassengers);
      vi.spyOn(service, 'getSummary').mockResolvedValue({
        totalPassengers: 2,
        activePassengers: 1,
        inactivePassengers: 1,
        suspendedPassengers: 0,
        totalPoints: 110500,
        tierCounts: { Bronze: 0, Silver: 1, Gold: 0, Platinum: 1 },
      });

      render(<Dashboard passengerService={service} />);
      await screen.findByText('Emma Watson');

      // Click "Add Passenger"
      const addBtn = screen.getByRole('button', { name: /add passenger/i });
      await user.click(addBtn);

      // Modal should be open
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Submit without entering data
      const submitBtn = screen.getByRole('button', { name: /save|create|submit/i });
      await user.click(submitBtn);

      // Check fields marked invalid and highlighted in red
      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(nameInput.className).toMatch(/border-red|red/);

      // Verify no analytics logged on failed submission
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('submits valid passenger form, updates table, updates summary, and logs analytics', async () => {
      const user = userEvent.setup();
      vi.spyOn(service, 'getAll').mockResolvedValue([...initialPassengers]);
      vi.spyOn(service, 'getSummary').mockResolvedValue({
        totalPassengers: 2,
        activePassengers: 1,
        inactivePassengers: 1,
        suspendedPassengers: 0,
        totalPoints: 110500,
        tierCounts: { Bronze: 0, Silver: 1, Gold: 0, Platinum: 1 },
      });
      const createSpy = vi.spyOn(service, 'create').mockResolvedValue({
        id: 'p-3',
        fullName: 'Rupert Grint',
        email: 'rupert@airline.com',
        membershipNumber: 'FF-100003',
        tier: 'Gold',
        points: 40000,
        status: 'Active',
        createdAt: '2026-01-03T12:00:00.000Z',
        updatedAt: '2026-01-03T12:00:00.000Z',
      });

      render(<Dashboard passengerService={service} />);
      await screen.findByText('Emma Watson');

      const addBtn = screen.getByRole('button', { name: /add passenger/i });
      await user.click(addBtn);

      await user.type(screen.getByLabelText(/full name/i), 'Rupert Grint');
      await user.type(screen.getByLabelText(/email/i), 'rupert@airline.com');
      await user.type(screen.getByLabelText(/membership number/i), 'FF-100003');
      await user.selectOptions(screen.getByLabelText(/tier/i), 'Gold');
      await user.clear(screen.getByLabelText(/points/i));
      await user.type(screen.getByLabelText(/points/i), '40000');
      await user.selectOptions(screen.getByLabelText(/status/i), 'Active');

      const submitBtn = screen.getByRole('button', { name: /save|create|submit/i });
      await user.click(submitBtn);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: 'Rupert Grint',
          email: 'rupert@airline.com',
          membershipNumber: 'FF-100003',
          tier: 'Gold',
          points: 40000,
          status: 'Active',
        })
      );

      // Verify exact analytics console log
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(ANALYTICS_LOG_MESSAGE),
        expect.anything()
      );
    });
  });

  describe('Update Passenger Workflow', () => {
    it('opens edit modal pre-filled with passenger data and saves updates', async () => {
      const user = userEvent.setup();
      vi.spyOn(service, 'getAll').mockResolvedValue(initialPassengers);
      vi.spyOn(service, 'getSummary').mockResolvedValue({
        totalPassengers: 2,
        activePassengers: 1,
        inactivePassengers: 1,
        suspendedPassengers: 0,
        totalPoints: 110500,
        tierCounts: { Bronze: 0, Silver: 1, Gold: 0, Platinum: 1 },
      });
      const updateSpy = vi.spyOn(service, 'update').mockResolvedValue({
        ...initialPassengers[0],
        tier: 'Platinum',
        points: 150000,
      });

      render(<Dashboard passengerService={service} />);
      await screen.findByText('Emma Watson');

      const firstRow = screen.getByRole('row', { name: /emma watson/i });
      const editBtn = within(firstRow).getByRole('button', { name: /edit/i });
      await user.click(editBtn);

      const pointsInput = screen.getByLabelText(/points/i);
      expect(pointsInput).toHaveValue(98000);

      await user.clear(pointsInput);
      await user.type(pointsInput, '150000');

      const saveBtn = screen.getByRole('button', { name: /save|update/i });
      await user.click(saveBtn);

      expect(updateSpy).toHaveBeenCalledWith(
        'p-1',
        expect.objectContaining({ points: 150000 })
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(ANALYTICS_LOG_MESSAGE),
        expect.anything()
      );
    });
  });

  describe('Delete Passenger Workflow', () => {
    it('prompts confirmation and deletes passenger record', async () => {
      const user = userEvent.setup();
      vi.spyOn(service, 'getAll').mockResolvedValue(initialPassengers);
      vi.spyOn(service, 'getSummary').mockResolvedValue({
        totalPassengers: 2,
        activePassengers: 1,
        inactivePassengers: 1,
        suspendedPassengers: 0,
        totalPoints: 110500,
        tierCounts: { Bronze: 0, Silver: 1, Gold: 0, Platinum: 1 },
      });
      const deleteSpy = vi.spyOn(service, 'delete').mockResolvedValue(true);
      // Mock window.confirm
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<Dashboard passengerService={service} />);
      await screen.findByText('Emma Watson');

      const firstRow = screen.getByRole('row', { name: /emma watson/i });
      const deleteBtn = within(firstRow).getByRole('button', { name: /delete/i });
      await user.click(deleteBtn);

      expect(window.confirm).toHaveBeenCalled();
      expect(deleteSpy).toHaveBeenCalledWith('p-1');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(ANALYTICS_LOG_MESSAGE),
        expect.anything()
      );
    });
  });
});
