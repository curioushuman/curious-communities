import { Record, Static } from 'runtypes';
import { MemberEmail } from '../../../../domain/value-objects/member-email';
import { MemberSourceId } from '../../../../domain/value-objects/member-source-id';

/**
 * This represents data we expect from EdApp
 * - some fields may be empty
 * - EdApp generally loves to return them as Null
 */
export const EdAppApiMemberSource = Record({
  id: MemberSourceId,
  email: MemberEmail,
});

export type EdAppApiMemberSource = Static<typeof EdAppApiMemberSource>;
