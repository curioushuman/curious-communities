/**
 * Converting a dashed string to camelCase
 */
export function dashToCamelCase(str: string): string {
  return str
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
}
