import {
  Passenger,
  PassengerFormData,
  PassengerSummaryStats,
  PassengerTier,
} from '../types/passenger';
import { StorageService, defaultStorage } from './storage';
import { validatePassengerForm } from './validation';
import { sanitizePassengerData } from './sanitizer';

export class PassengerService {
  private storage: StorageService;

  constructor(storage: StorageService = defaultStorage) {
    this.storage = storage;
  }

  /** Reports whether persistence is currently using the volatile in-memory fallback. */
  isUsingFallback(): boolean {
    return this.storage.isUsingFallback();
  }

  /**
   * Retrieves all passengers from storage.
   */
  async getAll(): Promise<Passenger[]> {
    return this.storage.loadPassengers();
  }

  /**
   * Retrieves a single passenger by unique ID, or returns null if not found.
   */
  async getById(id: string): Promise<Passenger | null> {
    const passengers = await this.getAll();
    const found = passengers.find((p) => p.id === id);
    return found || null;
  }

  /**
   * Creates a new passenger record after sanitization and validation.
   * Generates a unique ID and ISO timestamps.
   */
  async create(data: PassengerFormData): Promise<Passenger> {
    const sanitized = sanitizePassengerData(data);
    const existingPassengers = await this.getAll();
    const existingNumbers = existingPassengers.map((p) => p.membershipNumber);

    const validation = validatePassengerForm(sanitized, existingNumbers);
    if (!validation.isValid) {
      const errorMsg = Object.values(validation.errors).filter(Boolean).join('; ');
      throw new Error(`Validation failed: ${errorMsg}`);
    }

    const now = new Date().toISOString();
    const newPassenger: Passenger = {
      ...sanitized,
      id: `pass_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    const updatedList = [...existingPassengers, newPassenger];
    this.storage.savePassengers(updatedList);

    return newPassenger;
  }

  /**
   * Updates an existing passenger record. Preserves original ID and createdAt.
   * Re-validates updated fields and enforces membership number uniqueness.
   */
  async update(id: string, data: Partial<PassengerFormData>): Promise<Passenger> {
    const existingPassengers = await this.getAll();
    const targetIndex = existingPassengers.findIndex((p) => p.id === id);

    if (targetIndex === -1) {
      throw new Error(`Passenger not found with ID: ${id}`);
    }

    const currentPassenger = existingPassengers[targetIndex];
    const merged: PassengerFormData = {
      fullName: data.fullName ?? currentPassenger.fullName,
      email: data.email ?? currentPassenger.email,
      membershipNumber: data.membershipNumber ?? currentPassenger.membershipNumber,
      tier: data.tier ?? currentPassenger.tier,
      points: data.points ?? currentPassenger.points,
      status: data.status ?? currentPassenger.status,
    };

    const sanitized = sanitizePassengerData(merged);
    const otherNumbers = existingPassengers
      .filter((p) => p.id !== id)
      .map((p) => p.membershipNumber);

    const validation = validatePassengerForm(
      sanitized,
      otherNumbers,
      currentPassenger.membershipNumber
    );

    if (!validation.isValid) {
      const errorMsg = Object.values(validation.errors).filter(Boolean).join('; ');
      throw new Error(`Validation failed: ${errorMsg}`);
    }

    const updatedPassenger: Passenger = {
      ...currentPassenger,
      ...sanitized,
      id: currentPassenger.id,
      createdAt: currentPassenger.createdAt,
      updatedAt: new Date().toISOString(),
    };

    existingPassengers[targetIndex] = updatedPassenger;
    this.storage.savePassengers(existingPassengers);

    return updatedPassenger;
  }

  /**
   * Deletes a passenger by ID. Returns true if removed, false if not found.
   */
  async delete(id: string): Promise<boolean> {
    const existingPassengers = await this.getAll();
    const targetIndex = existingPassengers.findIndex((p) => p.id === id);

    if (targetIndex === -1) {
      return false;
    }

    const updatedList = existingPassengers.filter((p) => p.id !== id);
    this.storage.savePassengers(updatedList);
    return true;
  }

  /**
   * Searches passengers across fullName, email, and membershipNumber (case-insensitive),
   * with optional tier and status filters.
   */
  async search(
    query: string = '',
    tierFilter?: string,
    statusFilter?: string
  ): Promise<Passenger[]> {
    const passengers = await this.getAll();
    const normalizedQuery = query.trim().toLowerCase();

    return passengers.filter((p) => {
      // Query filter (matches full name, membership number, or email)
      const matchesQuery =
        !normalizedQuery ||
        p.fullName.toLowerCase().includes(normalizedQuery) ||
        p.membershipNumber.toLowerCase().includes(normalizedQuery) ||
        p.email.toLowerCase().includes(normalizedQuery);

      if (!matchesQuery) return false;

      // Tier filter
      if (tierFilter && tierFilter.trim().length > 0 && p.tier !== tierFilter) {
        return false;
      }

      // Status filter
      if (statusFilter && statusFilter.trim().length > 0 && p.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }

  /**
   * Computes aggregate statistics across all passengers:
   * total count, status breakdown, total points, and tier distribution.
   */
  async getSummary(): Promise<PassengerSummaryStats> {
    const passengers = await this.getAll();

    const tierCounts: Record<PassengerTier, number> = {
      Bronze: 0,
      Silver: 0,
      Gold: 0,
      Platinum: 0,
    };

    let activePassengers = 0;
    let inactivePassengers = 0;
    let suspendedPassengers = 0;
    let totalPoints = 0;

    for (const p of passengers) {
      if (p.tier in tierCounts) {
        tierCounts[p.tier]++;
      }
      if (p.status === 'Active') activePassengers++;
      else if (p.status === 'Inactive') inactivePassengers++;
      else if (p.status === 'Suspended') suspendedPassengers++;

      totalPoints += p.points || 0;
    }

    return {
      totalPassengers: passengers.length,
      activePassengers,
      inactivePassengers,
      suspendedPassengers,
      totalPoints,
      tierCounts,
    };
  }
}

export const defaultPassengerService = new PassengerService();
