import { Record, Static } from 'runtypes';
import { MemberEmail } from '../../../../domain/value-objects/member-email';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';

/**
 * This represents data we expect from Tribe
 * - some fields may be empty
 * - Tribe generally loves to return them as Null
 */
export const TribeApiMemberSource = Record({
  id: MemberSourceId,
  email: MemberEmail,
});

export type TribeApiMemberSource = Static<typeof TribeApiMemberSource>;
