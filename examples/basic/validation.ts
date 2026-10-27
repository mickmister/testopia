export function isValidEmail(value: string): boolean {
  return /^[^@]+@[^@]+\.[^@]+$/.test(value);
}
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}
