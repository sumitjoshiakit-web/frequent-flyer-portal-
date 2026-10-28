import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService, PASSENGERS_STORAGE_KEY } from '../services/storage';
import { Passenger } from '../types/passenger';

describe('Data Persistence & Unavailable Storage Handling (REQ-9)', () => {
  const samplePassengers: Passenger[] = [
    {
      id: 'p-1',
      fullName: 'Alice Walker',
      email: 'alice@airline.com',
      membershipNumber: 'FF-100001',
      tier: 'Platinum',
      points: 85000,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'p-2',
      fullName: 'Bob Martin',
      email: 'bob@airline.com',
      membershipNumber: 'FF-100002',
      tier: 'Bronze',
      points: 1200,
      status: 'Inactive',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  describe('Standard Storage Operations', () => {
    it('saves passengers to localStorage under the designated key', () => {
      const storage = new StorageService();
      const success = storage.savePassengers(samplePassengers);
      expect(success).toBe(true);

      const raw = localStorage.getItem(PASSENGERS_STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].membershipNumber).toBe('FF-100001');
    });

    it('loads stored passengers from localStorage across sessions', () => {
      localStorage.setItem(PASSENGERS_STORAGE_KEY, JSON.stringify(samplePassengers));
      const storage = new StorageService();
      const loaded = storage.loadPassengers();
      expect(loaded).toEqual(samplePassengers);
      expect(storage.isUsingFallback()).toBe(false);
    });

    it('returns empty array when localStorage is empty', () => {
      const storage = new StorageService();
      expect(storage.loadPassengers()).toEqual([]);
    });

    it('handles corrupted JSON in storage safely without crashing', () => {
      localStorage.setItem(PASSENGERS_STORAGE_KEY, 'corrupted{json[not:valid');
      const storage = new StorageService();
      const loaded = storage.loadPassengers();
      expect(loaded).toEqual([]);
    });

    it('clears stored records completely', () => {
      const storage = new StorageService();
      storage.savePassengers(samplePassengers);
      storage.clear();
      expect(storage.loadPassengers()).toEqual([]);
      expect(localStorage.getItem(PASSENGERS_STORAGE_KEY)).toBeNull();
    });
  });

  describe('Storage Unavailable & QuotaExceeded Fallback (Edge Case)', () => {
    it('falls back to in-memory store when localStorage throws QuotaExceededError on save', () => {
      const storage = new StorageService();

      // Mock setItem to throw QuotaExceededError
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });

      const success = storage.savePassengers(samplePassengers);
      expect(success).toBe(true);
      expect(storage.isUsingFallback()).toBe(true);

      // Data is still accessible in-memory
      const loaded = storage.loadPassengers();
      expect(loaded).toHaveLength(2);
      expect(loaded[0].fullName).toBe('Alice Walker');
    });

    it('falls back to in-memory store when storage is blocked (SecurityError)', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        const error = new DOMException('Access denied', 'SecurityError');
        throw error;
      });

      const storage = new StorageService();
      expect(storage.isUsingFallback()).toBe(true);
      expect(storage.loadPassengers()).toEqual([]);

      storage.savePassengers(samplePassengers);
      expect(storage.loadPassengers()).toHaveLength(2);
    });
  });
});
