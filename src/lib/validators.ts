export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const CODE_PATTERN = /^[A-Z0-9-]+$/;
export const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
export const USERNAME_PATTERN = /^[a-z0-9_.]+$/i;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function required(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} is required`;
  return undefined;
}

export function emailValid(value: string, label = 'Email'): string | undefined {
  if (!value.trim()) return `${label} is required`;
  return EMAIL_PATTERN.test(value.trim()) ? undefined : `Enter a valid ${label.toLowerCase()}`;
}

export function stringLength(
  value: string,
  label: string,
  { min, max }: { min?: number; max?: number },
): string | undefined {
  const trimmed = value.trim();
  if (min !== undefined && trimmed.length < min)
    return `${label} must be at least ${min} characters`;
  if (max !== undefined && trimmed.length > max) return `${label} must be under ${max} characters`;
  return undefined;
}

export function pattern(
  value: string,
  label: string,
  re: RegExp,
  message: string,
): string | undefined {
  if (!value.trim()) return undefined; // pair with required() separately if it's mandatory
  return re.test(value.trim()) ? undefined : `${label}: ${message}`;
}

export function positiveNumber(
  value: string | number,
  label: string,
  { max, integer = false }: { max?: number; integer?: boolean } = {},
): string | undefined {
  if (value === '' || value === undefined || value === null) return `${label} is required`;
  const num = Number(value);
  if (Number.isNaN(num)) return `${label} must be a valid number`;
  if (num <= 0) return `${label} must be greater than 0`;
  if (integer && !Number.isInteger(num)) return `${label} must be a whole number`;
  if (max !== undefined && num > max) return `${label} cannot exceed ${max}`;
  return undefined;
}

export function optionalNonNegativeNumber(
  value: string,
  label: string,
  { integer = false }: { integer?: boolean } = {},
): string | undefined {
  if (value === '') return undefined;
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return `${label} must be a valid, non-negative number`;
  if (integer && !Number.isInteger(num)) return `${label} must be a whole number`;
  return undefined;
}

export function dateNotInPast(value: string, label: string): string | undefined {
  if (!value) return undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return `${label}: enter a valid date`;
  if (date < today) return `${label} cannot be in the past`;
  return undefined;
}

export function dateTimeRangeValid(
  start: string,
  end: string,
  labels: { start: string; end: string },
): { start?: string; end?: string } {
  const errors: { start?: string; end?: string } = {};
  if (!start) errors.start = `${labels.start} is required`;
  if (!end) errors.end = `${labels.end} is required`;
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()))
      errors.start = `Enter a valid ${labels.start.toLowerCase()}`;
    else if (Number.isNaN(endDate.getTime()))
      errors.end = `Enter a valid ${labels.end.toLowerCase()}`;
    else if (endDate <= startDate)
      errors.end = `${labels.end} must be after ${labels.start.toLowerCase()}`;
  }
  return errors;
}

// Drops undefined values so a spread of these into a FieldErrors object stays clean.
export function compact<T extends Record<string, string | undefined>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}
