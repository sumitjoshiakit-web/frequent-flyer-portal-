import { AnalyticsAction } from '../types/passenger';

export const ANALYTICS_LOG_MESSAGE =
  '[Analytics] User interacted with End-to-End Frequent Flyer Portal';

/**
 * Emits a simulated telemetry event to console.log with the exact required string.
 * Sensitive passenger identifiers and contact details are omitted from metadata logging.
 */
export function trackUserInteraction(
  action: AnalyticsAction,
  metadata?: Record<string, unknown>
): void {
  // Safe metadata: exclude sensitive personal info like full names/emails
  const safeMetadata: Record<string, unknown> = {};
  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      if (!['email', 'fullName', 'membershipNumber'].includes(key)) {
        safeMetadata[key] = value;
      }
    }
  }

  console.log(ANALYTICS_LOG_MESSAGE, {
    action,
    metadata: safeMetadata,
  });
}
