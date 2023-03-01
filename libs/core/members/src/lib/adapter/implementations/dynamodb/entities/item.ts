import { DynamoDbItem } from '@curioushuman/common';

import { DynamoDbMemberAttributes, DynamoDbMemberSpecificKeys } from './member';

/**
 * Complete item that is returned from the DynamoDb query
 *
 * Each record will have member, and course information.
 * Throw allllll the attributes in.
 * Omitting any that may double up.
 *
 * TODO: there is probably a more elegant way of doing this.
 */
export type MembersItemKeys = Partial<DynamoDbMemberSpecificKeys>;
export type MembersItemAttributes = Partial<DynamoDbMemberAttributes>;
export type MembersItem = MembersItemKeys & MembersItemAttributes;

export type MembersDynamoDbItem = DynamoDbItem<MembersItem>;
