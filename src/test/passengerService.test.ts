import { describe, it, expect, beforeEach } from 'vitest';
import { PassengerService } from '../services/passengerService';
import { StorageService } from '../services/storage';
import { PassengerFormData } from '../types/passenger';

describe('Passenger Service CRUD & Logic (REQ-1, REQ-2, REQ-3, REQ-4)', () => {
  let storage: StorageService;
  let service: PassengerService;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService();
    service = new PassengerService(storage);
  });

  const validPassengerData: PassengerFormData = {
    fullName: 'Sarah Connor',
    email: 'sarah.connor@sky.net',
    membershipNumber: 'FF-777001',
    tier: 'Platinum',
    points: 120000,
    status: 'Active',
  };

  describe('Create Passenger', () => {
    it('creates a passenger record with a generated ID and timestamps', async () => {
      const passenger = await service.create(validPassengerData);

      expect(passenger.id).toBeDefined();
      expect(passenger.id.length).toBeGreaterThan(0);
      expect(passenger.fullName).toBe('Sarah Connor');
      expect(passenger.membershipNumber).toBe('FF-777001');
      expect(passenger.createdAt).toBeDefined();
      expect(passenger.updatedAt).toBeDefined();

      const all = await service.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(passenger.id);
    });

    it('rejects creation if membership number already exists', async () => {
      await service.create(validPassengerData);

      await expect(
        service.create({
          ...validPassengerData,
          fullName: 'Different Person',
          email: 'diff@sky.net',
        })
      ).rejects.toThrow(/unique|already exists/i);
    });

    it('rejects creation when required fields are missing or invalid', async () => {
      await expect(
        service.create({
          ...validPassengerData,
          email: 'invalid-email',
        })
      ).rejects.toThrow();
    });
  });

  describe('Read & Search Passengers', () => {
    beforeEach(async () => {
      await service.create(validPassengerData);
      await service.create({
        fullName: 'John Connor',
        email: 'john.connor@sky.net',
        membershipNumber: 'FF-777002',
        tier: 'Bronze',
        points: 500,
        status: 'Inactive',
      });
      await service.create({
        fullName: 'Kyle Reese',
        email: 'kyle.reese@sky.net',
        membershipNumber: 'FF-777003',
        tier: 'Gold',
        points: 62000,
        status: 'Suspended',
      });
    });

    it('retrieves all passengers', async () => {
      const all = await service.getAll();
      expect(all).toHaveLength(3);
    });

    it('retrieves passenger by ID', async () => {
      const all = await service.getAll();
      const first = all[0];
      const found = await service.getById(first.id);
      expect(found).toEqual(first);
    });

    it('returns null when retrieving non-existent ID', async () => {
      const found = await service.getById('non-existent-id');
      expect(found).toBeNull();
    });

    it('searches passengers by name (case-insensitive substring)', async () => {
      const results = await service.search('connor');
      expect(results).toHaveLength(2);
      expect(results.map((p) => p.fullName)).toContain('Sarah Connor');
      expect(results.map((p) => p.fullName)).toContain('John Connor');
    });

    it('searches passengers by membership number', async () => {
      const results = await service.search('777003');
      expect(results).toHaveLength(1);
      expect(results[0].fullName).toBe('Kyle Reese');
    });

    it('searches passengers by email', async () => {
      const results = await service.search('sarah.connor');
      expect(results).toHaveLength(1);
      expect(results[0].membershipNumber).toBe('FF-777001');
    });

    it('filters passengers by tier', async () => {
      const bronzeOnly = await service.search('', 'Bronze');
      expect(bronzeOnly).toHaveLength(1);
      expect(bronzeOnly[0].fullName).toBe('John Connor');
    });

    it('filters passengers by status', async () => {
      const suspendedOnly = await service.search('', undefined, 'Suspended');
      expect(suspendedOnly).toHaveLength(1);
      expect(suspendedOnly[0].fullName).toBe('Kyle Reese');
    });

    it('combines text query, tier, and status filters', async () => {
      const results = await service.search('Connor', 'Bronze', 'Inactive');
      expect(results).toHaveLength(1);
      expect(results[0].fullName).toBe('John Connor');

      const noMatches = await service.search('Connor', 'Gold', 'Active');
      expect(noMatches).toHaveLength(0);
    });
  });

  describe('Update Passenger', () => {
    it('updates existing passenger fields and updates updatedAt timestamp', async () => {
      const created = await service.create(validPassengerData);
      const originalUpdatedAt = created.updatedAt;

      // Small delay to ensure timestamp diff
      await new Promise((r) => setTimeout(r, 10));

      const updated = await service.update(created.id, {
        tier: 'Platinum',
        points: 150000,
        status: 'Active',
      });

      expect(updated.points).toBe(150000);
      expect(updated.id).toBe(created.id);
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(originalUpdatedAt).getTime()
      );
    });

    it('throws error when updating non-existent passenger', async () => {
      await expect(
        service.update('ghost-id', { points: 100 })
      ).rejects.toThrow(/not found/i);
    });

    it('rejects update if changing membership number to an existing one', async () => {
      const p1 = await service.create(validPassengerData);
      await service.create({
        ...validPassengerData,
        fullName: 'Another Person',
        membershipNumber: 'FF-888999',
        email: 'another@sky.net',
      });

      await expect(
        service.update(p1.id, { membershipNumber: 'FF-888999' })
      ).rejects.toThrow(/unique|already exists/i);
    });
  });

  describe('Delete Passenger', () => {
    it('deletes an existing passenger record', async () => {
      const created = await service.create(validPassengerData);
      const deleteResult = await service.delete(created.id);
      expect(deleteResult).toBe(true);

      const all = await service.getAll();
      expect(all).toHaveLength(0);
    });

    it('returns false or throws when deleting non-existent ID', async () => {
      const result = await service.delete('unknown-id');
      expect(result).toBe(false);
    });
  });

  describe('Passenger Summary Statistics (REQ-1)', () => {
    it('computes accurate aggregation stats for empty system', async () => {
      const summary = await service.getSummary();
      expect(summary.totalPassengers).toBe(0);
      expect(summary.activePassengers).toBe(0);
      expect(summary.inactivePassengers).toBe(0);
      expect(summary.suspendedPassengers).toBe(0);
      expect(summary.totalPoints).toBe(0);
      expect(summary.tierCounts).toEqual({
        Bronze: 0,
        Silver: 0,
        Gold: 0,
        Platinum: 0,
      });
    });

    it('computes accurate aggregate counts across tiers, statuses, and points', async () => {
      await service.create({ ...validPassengerData, membershipNumber: 'FF-001', tier: 'Bronze', points: 1000, status: 'Active' });
      await service.create({ ...validPassengerData, membershipNumber: 'FF-002', tier: 'Silver', points: 5000, status: 'Active' });
      await service.create({ ...validPassengerData, membershipNumber: 'FF-003', tier: 'Gold', points: 15000, status: 'Inactive' });
      await service.create({ ...validPassengerData, membershipNumber: 'FF-004', tier: 'Platinum', points: 50000, status: 'Suspended' });

      const summary = await service.getSummary();
      expect(summary.totalPassengers).toBe(4);
      expect(summary.activePassengers).toBe(2);
      expect(summary.inactivePassengers).toBe(1);
      expect(summary.suspendedPassengers).toBe(1);
      expect(summary.totalPoints).toBe(71000);
      expect(summary.tierCounts).toEqual({
        Bronze: 1,
        Silver: 1,
        Gold: 1,
        Platinum: 1,
      });
    });
  });
});
