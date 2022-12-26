import { ExternalId } from '@curioushuman/common';

import { GroupMemberSource } from '../../domain/entities/group-member-source';
import { GroupMemberSourceStatus } from '../../domain/value-objects/group-member-source-status';

/**
 * A builder for GroupMember Sources to play with in testing.
 */

/**
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

/**
 * This is basically a looser mimic of GroupMember
 * For the purpose of being able to create invalid GroupMembers & DTOs and such
 */
type GroupMemberSourceLooseMimic = {
  [K in keyof GroupMemberSource]?: GroupMemberSource[K] | string | number;
};

export const GroupMemberSourceBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: GroupMemberSourceLooseMimic = {
    id: '5008s1234519CjIAAU',
    memberId: '5008s1234519CjIABC',
    groupId: '5008s1234519CjIAEF',
    status: 'pending' as GroupMemberSourceStatus,
    memberName: 'James Brown',
    memberEmail: 'james@brown.com',
    memberOrganisationName: 'James Co',
  };
  const overrides: GroupMemberSourceLooseMimic = {
    id: defaultProperties.id,
    memberId: defaultProperties.memberId,
    groupId: defaultProperties.groupId,
    status: defaultProperties.status,
    memberName: defaultProperties.memberName,
    memberEmail: defaultProperties.memberEmail,
    memberOrganisationName: defaultProperties.memberOrganisationName,
  };

  return {
    alpha() {
      overrides.id = '5000K1234567GEYQA3';
      overrides.memberName = 'Jim Brown';
      return this;
    },

    beta() {
      overrides.id = '5008s000000y7LUAAY';
      overrides.memberName = 'June Brown';
      return this;
    },

    noMatchingSource() {
      return this;
    },

    invalidStatus() {
      overrides.memberName = 'Jones Invalid';
      overrides.status = 'this is invalid';
      return this;
    },

    invalidSource() {
      overrides.memberName = '';
      return this;
    },

    exists() {
      overrides.id = ExternalId.check('ThisSourceExists');
      return this;
    },

    updated() {
      overrides.id = ExternalId.check('ThisSourceExists');
      overrides.memberName = 'Jimmy Who Ha';
      return this;
    },

    build(): GroupMemberSource {
      return GroupMemberSource.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): GroupMemberSource {
      return {
        ...defaultProperties,
        ...overrides,
      } as GroupMemberSource;
    },
  };
};
