import { ExternalId, prepareExternalIdSourceValue } from '@curioushuman/common';
import { FindParticipantSourceDto } from '../../application/queries/find-participant-source/find-participant-source.dto';

import { ParticipantSource } from '../../domain/entities/participant-source';
import { ParticipantSourceStatus } from '../../domain/value-objects/participant-source-status';
import { ParticipantSourceResponseDto } from '../../infra/dto/participant-source.response.dto';
import { FindParticipantSourceRequestDto } from '../../infra/find-participant-source/dto/find-participant-source.request.dto';
import { ParticipantSourceMapper } from '../../infra/participant-source.mapper';
import config from '../../static/config';

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
    id: '5008s1234519CjIPPU',
    courseId: '5008s1234519CjIAAU',
    status: 'pending' as ParticipantSourceStatus,

    name: 'James Brown',
    email: 'james@brown.com',
    organisationName: 'James Co',
  };
  const overrides: ParticipantSourceLooseMimic = {
    id: defaultProperties.id,
    courseId: defaultProperties.courseId,
    status: defaultProperties.status,

    name: defaultProperties.name,
    email: defaultProperties.email,
    organisationName: defaultProperties.organisationName,
  };

  let source = config.defaults.primaryAccountSource;

  return {
    alpha() {
      overrides.id = '5000K1234567GEYQA3';
      overrides.name = 'Jim Brown';
      return this;
    },

    beta() {
      overrides.id = '5008s000000y7LUAAY';
      overrides.name = 'June Brown';
      return this;
    },

    alternateSource() {
      // NOTE: this is not a valid source
      // we only have a single source for courses ATM
      source = 'COMMUNITY';
      return this;
    },

    noMatchingSource() {
      return this;
    },

    invalid() {
      overrides.id = '';
      return this;
    },

    invalidStatus() {
      overrides.name = 'Jones Invalid';
      overrides.status = 'this is invalid' as ParticipantSourceStatus;
      return this;
    },

    invalidSource() {
      overrides.id = ExternalId.check('InvalidSourceId');
      overrides.email = '';
      return this;
    },

    exists() {
      overrides.id = ExternalId.check('ThisSourceExists');
      return this;
    },

    updated() {
      overrides.id = ExternalId.check('ThisSourceExists');
      overrides.status = 'registered' as ParticipantSourceStatus;
      return this;
    },

    doesntExist() {
      overrides.id = ExternalId.check('DoesntExist');
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

    buildParticipantSourceResponseDto(): ParticipantSourceResponseDto {
      const p = this.buildNoCheck();
      return ParticipantSourceMapper.toResponseDto(p);
    },

    buildFindParticipantSourceRequestDto(): FindParticipantSourceRequestDto {
      const build = this.buildNoCheck();
      return {
        idSourceValue: prepareExternalIdSourceValue(
          build.id,
          config.defaults.primaryAccountSource
        ),
      } as FindParticipantSourceRequestDto;
    },

    buildFindParticipantSourceDto(): FindParticipantSourceDto {
      const build = this.buildNoCheck();
      return {
        identifier: 'idSource',
        value: {
          id: build.id,
          source,
        },
        source,
      } as FindParticipantSourceDto;
    },
  };
};
