import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizePassengerData } from '../services/sanitizer';

describe('XSS Sanitization & Input Security (REQ-10)', () => {
  describe('sanitizeInput', () => {
    it('strips <script> tags and malicious payloads', () => {
      const malicious = '<script>alert("xss")</script>Jane Doe';
      const cleaned = sanitizeInput(malicious);
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('alert');
      expect(cleaned).toContain('Jane Doe');
    });

    it('strips inline event handler injection', () => {
      const malicious = '<img src="x" onerror="alert(document.cookie)">Captain Smith';
      const cleaned = sanitizeInput(malicious);
      expect(cleaned).not.toContain('onerror');
      expect(cleaned).not.toContain('alert');
      expect(cleaned).toContain('Captain Smith');
    });

    it('neutralizes javascript: URI schemes', () => {
      const malicious = 'javascript:void(0)';
      const cleaned = sanitizeInput(malicious);
      expect(cleaned).not.toContain('javascript:');
    });

    it('preserves valid characters such as hyphens, apostrophes, and accents', () => {
      const validNames = [
        "Mary O'Connor",
        'Jean-Luc Picard',
        'Renée Dupont',
        'John Smith Jr.',
      ];
      for (const name of validNames) {
        expect(sanitizeInput(name)).toBe(name);
      }
    });

    it('trims leading and trailing whitespace', () => {
      expect(sanitizeInput('  Alice Wonderland   ')).toBe('Alice Wonderland');
    });
  });

  describe('sanitizePassengerData', () => {
    it('sanitizes all string fields in a passenger object', () => {
      const rawData = {
        fullName: '<b onmouseover=alert(1)>John</b> Doe',
        email: 'john<script></script>@airline.com',
        membershipNumber: 'FF-100234',
        tier: 'Gold',
        points: 5000,
        status: 'Active',
      };

      const sanitized = sanitizePassengerData(rawData);
      expect(sanitized.fullName).not.toContain('onmouseover');
      expect(sanitized.fullName).toContain('John');
      expect(sanitized.email).not.toContain('<script>');
      expect(sanitized.points).toBe(5000);
      expect(sanitized.tier).toBe('Gold');
    });
  });
});
