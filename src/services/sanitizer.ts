import DOMPurify from 'dompurify';

/**
 * Sanitizes single string inputs:
 * - Neutralizes javascript: URI schemes
 * - Strips HTML tags, script blocks, and inline event handlers via DOMPurify
 * - Preserves legitimate characters (apostrophes, hyphens, accented letters)
 * - Trims leading and trailing whitespace
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // 1. Remove dangerous javascript: and data: URI schemes
  let cleaned = input.replace(/javascript\s*:/gi, '').replace(/data\s*:\s*text\/html/gi, '');

  // 2. Sanitize HTML tags and inline attributes via DOMPurify
  cleaned = DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  // 3. Trim whitespace
  return cleaned.trim();
}

/**
 * Recursively sanitizes all string fields within a passenger data object or dictionary.
 * Non-string primitives (numbers, booleans, dates) are preserved intact.
 */
export function sanitizePassengerData<T extends Record<string, unknown>>(data: T): T {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizePassengerData(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
