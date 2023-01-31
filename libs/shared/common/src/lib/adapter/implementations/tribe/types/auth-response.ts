import { AxiosResponse } from 'axios';

export interface TribeApiAuthResponse {
  access_token: string;
}

/**
 * Request sent for authentication
 */
export interface TribeApiAuthBody {
  client_id: string;
  client_secret: string;
  email: string;
  grant_type: string;
}

export type TribeApiAuthResponseAxios = AxiosResponse<
  TribeApiAuthResponse,
  TribeApiAuthBody
>;
