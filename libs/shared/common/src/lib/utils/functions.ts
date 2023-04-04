export function dashToUpperCaseFirst(str: string): string {
  return str
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
}

export function dashToCamelCase(str: string): string {
  const upper = dashToUpperCaseFirst(str);
  return upper[0].toLowerCase() + upper.slice(1);
}

/**
 * This is a little function to confirm the env vars we need
 * out of the gates. We check for other ones in context for
 * better error reporting.
 */
export function confirmEnvVars(requiredVars: string[]): void {
  requiredVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing environment variable ${envVar}`);
    }
  });
}

/**
 * Basic function to generate a unique ID
 */
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 9);
}
