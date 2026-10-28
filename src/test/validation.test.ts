import { describe, it, expect } from 'vitest';
import { validatePassengerForm } from '../services/validation';
import { PassengerFormData } from '../types/passenger';

describe('Passenger Form Validation (REQ-3 & REQ-5)', () => {
  const validData: PassengerFormData = {
    fullName: 'Jane Doe',
    email: 'jane.doe@airline.com',
    membershipNumber: 'FF-100234',
    tier: 'Gold',
    points: 45000,
    status: 'Active',
  };

  describe('Happy Path', () => {
    it('passes validation when all fields are completely valid', () => {
      const result = validatePassengerForm(validData, []);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('allows valid tiers: Bronze, Silver, Gold, Platinum', () => {
      const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum'] as const;
      for (const tier of tiers) {
        const result = validatePassengerForm({ ...validData, tier }, []);
        expect(result.isValid).toBe(true);
        expect(result.errors.tier).toBeUndefined();
      }
    });

    it('allows zero points as a valid non-negative integer', () => {
      const result = validatePassengerForm({ ...validData, points: 0 }, []);
      expect(result.isValid).toBe(true);
      expect(result.errors.points).toBeUndefined();
    });
  });

  describe('Missing Fields Handling', () => {
    it('fails when full name is empty or only whitespace', () => {
      const resultEmpty = validatePassengerForm({ ...validData, fullName: '' }, []);
      expect(resultEmpty.isValid).toBe(false);
      expect(resultEmpty.errors.fullName).toMatch(/required/i);

      const resultWhitespace = validatePassengerForm({ ...validData, fullName: '   ' }, []);
      expect(resultWhitespace.isValid).toBe(false);
      expect(resultWhitespace.errors.fullName).toMatch(/required|valid/i);
    });

    it('fails when email is empty', () => {
      const result = validatePassengerForm({ ...validData, email: '' }, []);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toMatch(/required/i);
    });

    it('fails when membership number is empty', () => {
      const result = validatePassengerForm({ ...validData, membershipNumber: '' }, []);
      expect(result.isValid).toBe(false);
      expect(result.errors.membershipNumber).toMatch(/required/i);
    });
  });

  describe('Malformed Fields Handling', () => {
    it('fails when full name is less than 2 characters', () => {
      const result = validatePassengerForm({ ...validData, fullName: 'A' }, []);
      expect(result.isValid).toBe(false);
      expect(result.errors.fullName).toMatch(/at least 2 characters/i);
    });

    it('fails when email is malformed', () => {
      const malformedEmails = [
        'plainaddress',
        '@missingusername.com',
        'username@.com',
        'username@domain',
        'user name@domain.com',
      ];
      for (const email of malformedEmails) {
        const result = validatePassengerForm({ ...validData, email }, []);
        expect(result.isValid).toBe(false);
        expect(result.errors.email).toMatch(/valid email/i);
      }
    });

    it('fails when membership number format is invalid', () => {
      const invalidNumbers = [
        '123',             // too short
        'INVALID#MEMBERSHIP!',
        'FF 123456',       // spaces not allowed
      ];
      for (const membershipNumber of invalidNumbers) {
        const result = validatePassengerForm({ ...validData, membershipNumber }, []);
        expect(result.isValid).toBe(false);
        expect(result.errors.membershipNumber).toMatch(/format|alphanumeric|valid/i);
      }
    });

    it('fails when points are negative', () => {
      const result = validatePassengerForm({ ...validData, points: -500 }, []);
      expect(result.isValid).toBe(false);
      expect(result.errors.points).toMatch(/positive|cannot be negative|non-negative/i);
    });

    it('fails when points are floating point numbers', () => {
      const result = validatePassengerForm({ ...validData, points: 150.75 }, []);
      expect(result.isValid).toBe(false);
      expect(result.errors.points).toMatch(/integer|whole number/i);
    });

    it('fails when tier is invalid', () => {
      const result = validatePassengerForm({ ...validData, tier: 'Diamond' as unknown as PassengerFormData['tier'] }, []);
      expect(result.isValid).toBe(false);
      expect(result.errors.tier).toMatch(/valid tier/i);
    });

    it('fails when status is invalid', () => {
      const result = validatePassengerForm({ ...validData, status: 'Archived' as unknown as PassengerFormData['status'] }, []);
      expect(result.isValid).toBe(false);
      expect(result.errors.status).toMatch(/valid status/i);
    });
  });

  describe('Membership Number Uniqueness (REQ-3)', () => {
    it('fails when membership number already exists in database', () => {
      const existing = ['FF-100234', 'FF-999999'];
      const result = validatePassengerForm(validData, existing);
      expect(result.isValid).toBe(false);
      expect(result.errors.membershipNumber).toMatch(/unique|already exists/i);
    });

    it('checks uniqueness case-insensitively', () => {
      const existing = ['ff-100234'];
      const result = validatePassengerForm({ ...validData, membershipNumber: 'FF-100234' }, existing);
      expect(result.isValid).toBe(false);
      expect(result.errors.membershipNumber).toMatch(/unique|already exists/i);
    });

    it('allows passenger to keep their own membership number when updating', () => {
      const existing = ['FF-100234', 'FF-999999'];
      // Current passenger's number is FF-100234
      const result = validatePassengerForm(
        validData,
        existing,
        'FF-100234' // current number being edited
      );
      expect(result.isValid).toBe(true);
      expect(result.errors.membershipNumber).toBeUndefined();
    });
  });
});
