/**
 * Converting a dashed string to camelCase
 */
export function dashToCamelCase(str: string): string {
  return str
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
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
