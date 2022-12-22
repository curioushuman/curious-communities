import { ExternalId } from '@curioushuman/common';

import { ParticipantSource } from '../../domain/entities/participant-source';
import { ParticipantSourceStatus } from '../../domain/value-objects/participant-source-status';

/**
 * A builder for Participant Sources to play with in testing.
 */

/**
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

/**
 * This is basically a looser mimic of Participant
 * For the purpose of being able to create invalid Participants & DTOs and such
 */
type ParticipantSourceLooseMimic = {
  [K in keyof ParticipantSource]?: ParticipantSource[K] | string | number;
};

export const ParticipantSourceBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: ParticipantSourceLooseMimic = {
    id: '5008s1234519CjIAAU',
    memberId: '5008s1234519CjIABC',
    courseId: '5008s1234519CjIAEF',
    status: 'pending' as ParticipantSourceStatus,
    memberName: 'James Brown',
    memberEmail: 'james@brown.com',
    memberOrganisationName: 'James Co',
  };
  const overrides: ParticipantSourceLooseMimic = {
    id: defaultProperties.id,
    memberId: defaultProperties.memberId,
    courseId: defaultProperties.courseId,
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

    build(): ParticipantSource {
      return ParticipantSource.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): ParticipantSource {
      return {
        ...defaultProperties,
        ...overrides,
      } as ParticipantSource;
    },
  };
};