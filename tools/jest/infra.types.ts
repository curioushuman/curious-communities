/**
 * Interface for our prepping strategies
 */
export interface JestPrepStrategy {
  stackTitle: string;
  props: JestPrepProps;
  getApiUrl(): Promise<string>;
}

/**
 * Information required to prep a stack for Jest
 */
export interface JestPrepProps {
  localStackPath: string;
}
