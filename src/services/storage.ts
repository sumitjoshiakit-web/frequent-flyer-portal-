import { Passenger, StorageOptions } from '../types/passenger';

export const PASSENGERS_STORAGE_KEY = 'frequent_flyer_passengers';

export class StorageService {
  private key: string;
  private fallbackStore: Passenger[] = [];
  private fallbackMode: boolean = false;

  constructor(options: StorageOptions = {}) {
    this.key = options.storageKey || PASSENGERS_STORAGE_KEY;

    if (options.useFallbackInMemory) {
      this.fallbackMode = true;
      return;
    }

    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        this.fallbackMode = true;
      } else {
        // Probe storage accessibility
        window.localStorage.getItem(this.key);
      }
    } catch {
      this.fallbackMode = true;
    }
  }

  loadPassengers(): Passenger[] {
    if (this.fallbackMode) {
      return [...this.fallbackStore];
    }

    try {
      const raw = window.localStorage.getItem(this.key);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed as Passenger[];
    } catch (err) {
      if (err instanceof DOMException && (err.name === 'SecurityError' || err.code === 18)) {
        this.fallbackMode = true;
        return [...this.fallbackStore];
      }
      // For corrupted JSON or syntax errors, return empty list safely
      return [];
    }
  }

  savePassengers(passengers: Passenger[]): boolean {
    if (this.fallbackMode) {
      this.fallbackStore = [...passengers];
      return true;
    }

    try {
      window.localStorage.setItem(this.key, JSON.stringify(passengers));
      return true;
    } catch {
      // Handles QuotaExceededError and SecurityError seamlessly
      this.fallbackMode = true;
      this.fallbackStore = [...passengers];
      return true;
    }
  }

  isUsingFallback(): boolean {
    return this.fallbackMode;
  }

  clear(): void {
    this.fallbackStore = [];
    if (!this.fallbackMode) {
      try {
        window.localStorage.removeItem(this.key);
      } catch {
        this.fallbackMode = true;
      }
    }
  }
}

export const defaultStorage = new StorageService();
