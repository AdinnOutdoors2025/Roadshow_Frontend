import {
  differenceInCalendarDays,
  format,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns";

export type CurrencyFormatOptions = {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export type DateValue =
  | Date
  | string
  | number
  | null
  | undefined;

export type DateFormatOptions = {
  pattern?: string;
  fallback?: string;
};

/**
 * Safely converts numbers and formatted currency strings into numbers.
 *
 * Supported examples:
 * 25000
 * "25000"
 * "25,000"
 * "₹25,000"
 */
export const toSafeNumber = (value: unknown): number => {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  const cleanedValue = String(value ?? "").replace(
    /[^\d.-]/g,
    ""
  );

  const parsedValue = Number(cleanedValue);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
};

/**
 * Common currency formatter.
 * Defaults to Indian Rupees.
 */
export const formatCurrency = (
  amount: unknown,
  options: CurrencyFormatOptions = {}
): string => {
  const {
    currency = "INR",
    locale = "en-IN",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options;

  const numericAmount = toSafeNumber(amount);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericAmount);
};

/**
 * Safely converts Date, ISO string, or timestamp values into a valid Date.
 * Date-only ISO values such as "2026-07-21" are parsed without UTC shifting.
 */
export const toSafeDate = (
  value: DateValue
): Date | null => {
  if (value instanceof Date) {
    return isValid(value)
      ? new Date(value.getTime())
      : null;
  }

  if (typeof value === "number") {
    const dateFromTimestamp = new Date(value);

    return isValid(dateFromTimestamp)
      ? dateFromTimestamp
      : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) return null;

  const isoDate = parseISO(trimmedValue);

  if (isValid(isoDate)) {
    return isoDate;
  }

  const nativeDate = new Date(trimmedValue);

  return isValid(nativeDate)
    ? nativeDate
    : null;
};

/**
 * Common date formatter.
 * Default output: 21/07/2026
 */
export const formatDate = (
  value: DateValue,
  options: DateFormatOptions = {}
): string => {
  const {
    pattern = "dd/MM/yyyy",
    fallback = "",
  } = options;

  const safeDate = toSafeDate(value);

  return safeDate
    ? format(safeDate, pattern)
    : fallback;
};

/**
 * Common date-range formatter.
 * Example: 21 Jul 2026 - 25 Jul 2026
 */
export const formatDateRange = (
  startDate: DateValue,
  endDate: DateValue,
  options: DateFormatOptions & {
    separator?: string;
  } = {}
): string => {
  const {
    separator = " - ",
    fallback = "",
    ...dateOptions
  } = options;

  const startText = formatDate(startDate, {
    ...dateOptions,
    fallback: "",
  });

  const endText = formatDate(endDate, {
    ...dateOptions,
    fallback: "",
  });

  if (!startText || !endText) {
    return fallback;
  }

  return `${startText}${separator}${endText}`;
};

/**
 * Converts a date into the backend/API format.
 * Example: 2026-07-21
 */
export const formatDateForApi = (
  value: DateValue
): string => {
  return formatDate(value, {
    pattern: "yyyy-MM-dd",
    fallback: "",
  });
};

/**
 * Parses a previously stored ISO date safely.
 */
export const parseStoredDate = (
  value: string | null | undefined
): Date | null => {
  return toSafeDate(value);
};

/**
 * Inclusive campaign-day count.
 * 21 Jul to 21 Jul = 1 day.
 */
export const getInclusiveDayCount = (
  startDate: DateValue,
  endDate: DateValue
): number => {
  const safeStartDate = toSafeDate(startDate);
  const safeEndDate = toSafeDate(endDate);

  if (!safeStartDate || !safeEndDate) {
    return 0;
  }

  return Math.max(
    differenceInCalendarDays(
      startOfDay(safeEndDate),
      startOfDay(safeStartDate)
    ) + 1,
    0
  );
};
