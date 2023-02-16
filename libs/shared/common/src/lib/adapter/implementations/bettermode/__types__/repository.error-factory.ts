export interface BettermodeApiRepositoryError extends Error {
  code: string;
  status: number;
  message: string;
}
