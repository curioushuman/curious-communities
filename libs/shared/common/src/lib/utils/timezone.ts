import { ConfigWithTimezone } from './__types__';

const defaultTimezoneOffset = -11;

/**
 * Extracts timezone offset from config, or returns default
 */
function getTimezoneOffset(config?: ConfigWithTimezone) {
  const offsetHours = config?.timezone?.offset || defaultTimezoneOffset;
  return offsetHours * 60 * 60 * 1000;
}

/**
 * Returns timestamp based on timezone, or default timezone
 */
export function timezoneTimestamp(
  dateString?: string | undefined,
  config?: ConfigWithTimezone
): number {
  const timestampUtc = dateString ? new Date(dateString).getTime() : Date.now();
  return timestampUtc + getTimezoneOffset(config);
}

/**
 * Convenience function for getting current timestamp in timezone
 */
export function timezoneNow(config?: ConfigWithTimezone) {
  return timezoneTimestamp(undefined, config);
}

/**
 * Convenience function to get a timezone timestamp offset by specific number of hours
 */
export function timezoneTimestampOffset(
  offsetHours: number,
  config?: ConfigWithTimezone
) {
  return timezoneNow(config) + offsetHours * 60 * 60 * 1000;
}
