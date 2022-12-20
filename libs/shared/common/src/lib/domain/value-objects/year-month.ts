import { Static, String } from 'runtypes';
import { Timestamp } from './timestamp';

export const yearMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * A runtype for a year-month string
 */
export const YearMonth = String.withConstraint(
  (maybeYearMonth) =>
    yearMonthRegex.test(maybeYearMonth) ||
    'Year month values must be in the format YYYY-MM'
);

/**
 * A year month string matching the format YYYY-MM
 */
export type YearMonth = Static<typeof YearMonth>;

export const createYearMonth = (timestamp: Timestamp): YearMonth => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return YearMonth.check(`${year}-${month}`);
};
