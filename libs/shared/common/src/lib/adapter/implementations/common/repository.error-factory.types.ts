export interface BasicHttpRepositoryError extends Error {
  statusCode: number;
  error: string;
  message: string;
}
