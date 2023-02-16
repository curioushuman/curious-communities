/**
 * Helps to get the type of a value of an object
 *
 * https://stackoverflow.com/questions/49285864/is-there-a-valueof-similar-to-keyof-in-typescript
 */
export type ValueOf<T> = T[keyof T];
