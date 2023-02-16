/**
 * Props for findAll
 */
export interface RestApiFindAllProps {
  page?: number;
  limit?: number;
}
export type RestApiFindAllPropsConfirmed = Required<RestApiFindAllProps>;

/**
 * Response for findAll
 */
export interface RestApiFindAllResponse<DomainT> {
  items: DomainT[];
  // a simple boolean to help with pagination
  next: boolean;
  // not all APIs return this; hence the reason for next
  totalCount?: number;
}
