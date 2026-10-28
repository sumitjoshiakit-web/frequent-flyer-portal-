import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackUserInteraction, ANALYTICS_LOG_MESSAGE } from '../services/analytics';
import { AnalyticsAction } from '../types/passenger';

describe('Analytics & Telemetry Simulation (REQ-12)', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('exports the exact required message constant', () => {
    expect(ANALYTICS_LOG_MESSAGE).toBe(
      '[Analytics] User interacted with End-to-End Frequent Flyer Portal'
    );
  });

  it('logs the exact analytics string to console on primary user actions', () => {
    const actions: AnalyticsAction[] = [
      'create_passenger',
      'update_passenger',
      'delete_passenger',
      'search_passenger',
      'retry_operation',
    ];

    for (const action of actions) {
      consoleSpy.mockClear();
      trackUserInteraction(action, { timestamp: Date.now() });

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      const firstArg = consoleSpy.mock.calls[0][0];
      expect(firstArg).toContain(ANALYTICS_LOG_MESSAGE);
    }
  });

  it('includes action context and metadata in the telemetry log', () => {
    trackUserInteraction('create_passenger', {
      membershipNumber: 'FF-999123',
      fullName: 'Test Passenger',
      email: 'passenger@example.com',
      source: 'form',
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(ANALYTICS_LOG_MESSAGE),
      expect.objectContaining({
        action: 'create_passenger',
        metadata: { source: 'form' },
      })
    );
  });
});
