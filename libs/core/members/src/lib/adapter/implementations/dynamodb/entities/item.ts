import { DynamoDbItem } from '@curioushuman/common';

import { DynamoDbMemberAttributes } from './member';

/**
 * Complete item that is returned from the DynamoDb query
 *
 * Each record will have member, and course information.
 * Throw allllll the attributes in.
 * Omitting any that may double up.
 *
 * TODO: there is probably a more elegant way of doing this.
 */
export type MembersItem = Partial<DynamoDbMemberAttributes>;

export type MembersDynamoDbItem = DynamoDbItem<MembersItem>;
