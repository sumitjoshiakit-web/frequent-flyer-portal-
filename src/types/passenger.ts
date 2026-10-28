export type PassengerTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export type PassengerStatus = 'Active' | 'Inactive' | 'Suspended';

export interface Passenger {
  id: string;
  fullName: string;
  email: string;
  membershipNumber: string;
  tier: PassengerTier;
  points: number;
  status: PassengerStatus;
  createdAt: string;
  updatedAt: string;
}

export type PassengerFormData = Omit<Passenger, 'id' | 'createdAt' | 'updatedAt'>;

export interface PassengerValidationErrors {
  fullName?: string;
  email?: string;
  membershipNumber?: string;
  tier?: string;
  points?: string;
  status?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: PassengerValidationErrors;
}

export interface PassengerSummaryStats {
  totalPassengers: number;
  activePassengers: number;
  inactivePassengers: number;
  suspendedPassengers: number;
  totalPoints: number;
  tierCounts: Record<PassengerTier, number>;
}

export interface StorageOptions {
  storageKey?: string;
  useFallbackInMemory?: boolean;
}

export type AnalyticsAction = 
  | 'create_passenger'
  | 'update_passenger'
  | 'delete_passenger'
  | 'search_passenger'
  | 'retry_operation'
  | 'export_data';
