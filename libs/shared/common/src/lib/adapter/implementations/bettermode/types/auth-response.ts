import { AxiosResponse } from 'axios';
import { BettermodeApiQuery, BettermodeApiResponse } from './base-response';

interface BettermodeApiAuthResponseBase {
  accessToken: string;
  role: {
    name: string;
    scopes: string[];
  };
  member: {
    id: string;
    name: string;
  };
}

interface BettermodeApiAuthResponseGuestData {
  tokens: BettermodeApiAuthResponseBase;
}

interface BettermodeApiAuthResponseAdminData {
  loginNetwork: BettermodeApiAuthResponseBase;
}

type BettermodeApiAuthResponseGuest =
  BettermodeApiResponse<BettermodeApiAuthResponseGuestData>;
type BettermodeApiAuthResponseAdmin =
  BettermodeApiResponse<BettermodeApiAuthResponseAdminData>;

export type BettermodeApiAuthResponse =
  | BettermodeApiAuthResponseGuest
  | BettermodeApiAuthResponseAdmin;

export type BettermodeApiAuthResponseAxios = AxiosResponse<
  BettermodeApiAuthResponse,
  BettermodeApiQuery
>;
