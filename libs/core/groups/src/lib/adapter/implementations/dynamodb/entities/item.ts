import { DynamoDbItem } from '@curioushuman/common';

import { DynamoDbGroupAttributes } from './group';
import { DynamoDbGroupMemberAttributes } from './group-member';
import { DynamoDbMemberAttributes } from './member';

/**
 * Complete item that is returned from the DynamoDb query
 *
 * Each record will have groupMember, and group information.
 * Throw allllll the attributes in.
 * Omitting any that may double up.
 *
 * TODO: there is probably a more elegant way of doing this.
 */
export type GroupsItem = Partial<DynamoDbGroupMemberAttributes> &
  Omit<Partial<DynamoDbGroupAttributes>, 'AccountOwner'> &
  Omit<Partial<DynamoDbMemberAttributes>, 'AccountOwner'>;

export type GroupsDynamoDbItem = DynamoDbItem<GroupsItem>;
