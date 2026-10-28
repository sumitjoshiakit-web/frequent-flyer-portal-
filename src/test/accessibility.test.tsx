import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PassengerTable } from '../components/PassengerTable';
import { PassengerFormModal } from '../components/PassengerFormModal';
import { Passenger } from '../types/passenger';

describe('Accessibility, Semantic HTML & Keyboard Navigation (REQ-11 & NFR a11y)', () => {
  const samplePassenger: Passenger = {
    id: 'p-1',
    fullName: 'Grace Hopper',
    email: 'grace.hopper@navy.mil',
    membershipNumber: 'FF-000101',
    tier: 'Platinum',
    points: 100000,
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  describe('Semantic Table Structure', () => {
    it('uses semantic table elements with column header scopes', () => {
      render(
        <PassengerTable
          passengers={[samplePassenger]}
          searchQuery=""
          onSearchChange={vi.fn()}
          selectedTier=""
          onTierChange={vi.fn()}
          selectedStatus=""
          onStatusChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onAddNew={vi.fn()}
        />
      );

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThanOrEqual(6);

      for (const th of headers) {
        expect(th).toHaveAttribute('scope', 'col');
      }
    });

    it('provides descriptive accessible labels on action buttons within table rows', () => {
      render(
        <PassengerTable
          passengers={[samplePassenger]}
          searchQuery=""
          onSearchChange={vi.fn()}
          selectedTier=""
          onTierChange={vi.fn()}
          selectedStatus=""
          onStatusChange={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onAddNew={vi.fn()}
        />
      );

      // Edit and Delete buttons should specify which passenger they affect
      const editBtn = screen.getByRole('button', { name: /edit grace hopper/i });
      const deleteBtn = screen.getByRole('button', { name: /delete grace hopper/i });

      expect(editBtn).toBeInTheDocument();
      expect(deleteBtn).toBeInTheDocument();
    });
  });

  describe('Form Labels & ARIA Attributes in Modal', () => {
    it('has explicit labels bound to every form input', () => {
      render(
        <PassengerFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      const fullNameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const membershipInput = screen.getByLabelText(/membership number/i);
      const tierSelect = screen.getByLabelText(/tier/i);
      const pointsInput = screen.getByLabelText(/points/i);
      const statusSelect = screen.getByLabelText(/status/i);

      expect(fullNameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
      expect(membershipInput).toBeInTheDocument();
      expect(tierSelect).toBeInTheDocument();
      expect(pointsInput).toBeInTheDocument();
      expect(statusSelect).toBeInTheDocument();

      expect(fullNameInput).toHaveAttribute('id');
      expect(emailInput).toHaveAttribute('id');
    });

    it('sets role="dialog", aria-modal="true", and aria-labelledby on modal', () => {
      render(
        <PassengerFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');

      const labelId = dialog.getAttribute('aria-labelledby');
      const heading = document.getElementById(labelId!);
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation & Focus Management', () => {
    it('dismisses modal on Escape key press', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <PassengerFormModal
          isOpen={true}
          onClose={onClose}
          onSubmit={vi.fn()}
        />
      );

      await user.keyboard('{Escape}');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('allows full keyboard navigation through form fields using Tab', async () => {
      const user = userEvent.setup();

      render(
        <PassengerFormModal
          isOpen={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
        />
      );

      const fullNameInput = screen.getByLabelText(/full name/i);
      fullNameInput.focus();
      expect(fullNameInput).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/email/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/membership number/i)).toHaveFocus();
    });
  });
});
