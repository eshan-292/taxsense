/**
 * Format a number in Indian numbering system with rupee symbol
 * e.g., 1250000 -> "12,50,000"
 */
export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const str = abs.toString();

  if (str.length <= 3) {
    return (isNegative ? "-" : "") + str;
  }

  // Last 3 digits
  let result = str.slice(-3);
  let remaining = str.slice(0, -3);

  // Group remaining digits in pairs
  while (remaining.length > 2) {
    result = remaining.slice(-2) + "," + result;
    remaining = remaining.slice(0, -2);
  }

  if (remaining.length > 0) {
    result = remaining + "," + result;
  }

  return (isNegative ? "-" : "") + result;
}

/**
 * Format with rupee symbol
 */
export function formatRupee(amount: number): string {
  return "\u20B9" + formatINR(amount);
}

/**
 * Parse Indian formatted number string to number
 */
export function parseINR(str: string): number {
  return parseInt(str.replace(/,/g, "").replace(/\u20B9/g, ""), 10) || 0;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
