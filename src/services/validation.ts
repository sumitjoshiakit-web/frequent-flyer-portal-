import { PassengerFormData, ValidationResult, PassengerValidationErrors, PassengerTier, PassengerStatus } from '../types/passenger';

const VALID_TIERS: PassengerTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
const VALID_STATUSES: PassengerStatus[] = ['Active', 'Inactive', 'Suspended'];

// RFC-compliant email regex ensuring local-part, @, domain name, and valid TLD with no whitespace
const EMAIL_REGEX = /^[^\s@]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

// Membership numbers must be 5-20 alphanumeric characters, with optional hyphens and no spaces
const MEMBERSHIP_NUMBER_REGEX = /^[A-Za-z0-9-]{5,20}$/;

export function validatePassengerForm(
  data: PassengerFormData,
  existingMembershipNumbers: string[] = [],
  currentMembershipNumber?: string
): ValidationResult {
  const errors: PassengerValidationErrors = {};

  // 1. Full Name Validation
  if (!data.fullName || data.fullName.trim().length === 0) {
    errors.fullName = 'Full name is required';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  // 2. Email Validation
  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Please provide a valid email address';
  }

  // 3. Membership Number Validation
  if (!data.membershipNumber || data.membershipNumber.trim().length === 0) {
    errors.membershipNumber = 'Membership number is required';
  } else if (!MEMBERSHIP_NUMBER_REGEX.test(data.membershipNumber.trim())) {
    errors.membershipNumber = 'Membership number must be valid alphanumeric format';
  } else {
    // Uniqueness validation (case-insensitive)
    const normalizedInput = data.membershipNumber.trim().toUpperCase();
    const isSelf =
      currentMembershipNumber &&
      currentMembershipNumber.trim().toUpperCase() === normalizedInput;

    if (!isSelf) {
      const isDuplicate = existingMembershipNumbers.some(
        (existing) => existing.trim().toUpperCase() === normalizedInput
      );
      if (isDuplicate) {
        errors.membershipNumber = 'Membership number must be unique and already exists';
      }
    }
  }

  // 4. Points Validation
  if (data.points === undefined || data.points === null || typeof data.points !== 'number' || isNaN(data.points)) {
    errors.points = 'Points are required and must be a valid number';
  } else if (data.points < 0) {
    errors.points = 'Points cannot be negative';
  } else if (!Number.isInteger(data.points)) {
    errors.points = 'Points must be an integer whole number';
  }

  // 5. Tier Validation
  if (!data.tier) {
    errors.tier = 'Tier is required';
  } else if (!VALID_TIERS.includes(data.tier)) {
    errors.tier = 'Please select a valid tier (Bronze, Silver, Gold, Platinum)';
  }

  // 6. Status Validation
  if (!data.status) {
    errors.status = 'Status is required';
  } else if (!VALID_STATUSES.includes(data.status)) {
    errors.status = 'Please select a valid status (Active, Inactive, Suspended)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
