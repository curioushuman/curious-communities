import { DynamoDbItem } from '@curioushuman/common';

import { DynamoDbGroupAttributes, DynamoDbGroupSpecificKeys } from './group';
import {
  DynamoDbGroupMemberAttributes,
  DynamoDbGroupMemberSpecificKeys,
} from './group-member';
import { DynamoDbMemberAttributes } from './member';

/**
 * Complete item that is returned from the DynamoDb query
 *
 * Each record will have groupMember, and group information.
 * Throw allllll the attributes in.
 *
 * TODO: there is probably a more elegant way of doing this.
 */
export type GroupsItemKeys = Partial<DynamoDbGroupMemberSpecificKeys> &
  Partial<DynamoDbGroupSpecificKeys>;

export type GroupsItemAttributes = Partial<DynamoDbGroupMemberAttributes> &
  Partial<DynamoDbGroupAttributes> &
  Partial<DynamoDbMemberAttributes>;

export type GroupsItem = GroupsItemKeys & GroupsItemAttributes;

export type GroupsDynamoDbItem = DynamoDbItem<GroupsItem>;
