import { Participant } from '../../domain/entities/participant';
import { ParticipantSource } from '../../domain/entities/participant-source';
import { ParticipantResponseDto } from '../../infra/dto/participant.response.dto';
import { CreateParticipantRequestDto } from '../../infra/create-participant/dto/create-participant.request.dto';
import { CreateParticipantDto } from '../../application/commands/create-participant/create-participant.dto';
import { ParticipantSourceBuilder } from './participant-source.builder';
import config from '../../static/config';
import { ParticipantStatus } from '../../domain/value-objects/participant-status';
import { UpdateParticipantRequestDto } from '../../infra/update-participant/dto/update-participant.request.dto';
import { UpdateParticipantDto } from '../../application/commands/update-participant/update-participant.dto';
import { FindParticipantDto } from '../../application/queries/find-participant/find-participant.dto';
import {
  FindByIdParticipantRequestDto,
  FindByIdSourceValueParticipantRequestDto,
} from '../../infra/find-participant/dto/find-participant.request.dto';
import { prepareExternalIdSourceValue } from '@curioushuman/common';

/**
 * A builder for Participants to play with in testing.
 *
 * NOTES
 * - We include alphas, betas etc to overcome duplicates during testing
 *
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

/**
 * This is basically a looser mimic of Participant
 * For the purpose of being able to create invalid Participants & DTOs and such
 */
type ParticipantLooseMimic = {
  [K in keyof Participant]?: Participant[K] | string | number | object;
};

export const ParticipantBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: ParticipantLooseMimic = {
    id: '5008s1234519CjIAAU',
    memberId: '5008s1234519CjIABC',
    courseId: '5008s1234519CjIAEF',
    status: 'pending' as ParticipantStatus,

    sourceIds: [
      {
        id: '5008s1234519CjIAAU',
        source: 'COURSE',
      },
    ],

    memberName: 'James Brown',
    memberEmail: 'james@brown.com',
    memberOrganisationName: 'James Co',

    accountOwner: config.defaults.accountOwner,
  };
  const overrides: ParticipantLooseMimic = {
    id: defaultProperties.id,
    memberId: defaultProperties.memberId,
    courseId: defaultProperties.courseId,
    status: defaultProperties.status,

    sourceIds: defaultProperties.sourceIds,

    memberName: defaultProperties.memberName,
    memberEmail: defaultProperties.memberEmail,
    memberOrganisationName: defaultProperties.memberOrganisationName,

    accountOwner: defaultProperties.accountOwner,
  };

  return {
    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = ParticipantSourceBuilder().alpha().buildNoCheck();
      overrides.id = source.id;
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = ParticipantSourceBuilder().beta().buildNoCheck();
      overrides.id = source.id;
      return this;
    },

    invalidSource() {
      const source = ParticipantSourceBuilder().invalidSource().buildNoCheck();
      overrides.id = source.id;
      return this;
    },

    invalidStatus() {
      const source = ParticipantSourceBuilder().invalidStatus().buildNoCheck();
      overrides.id = source.id;
      return this;
    },

    noMatchingSource() {
      overrides.id = 'NoMatchingSource';
      return this;
    },

    invalid() {
      delete defaultProperties.id;
      delete overrides.id;
      return this;
    },

    exists() {
      const source = ParticipantSourceBuilder().exists().build();
      overrides.id = source.id;
      return this;
    },

    doesntExist() {
      overrides.id = 'ParticipantDoesntExist';
      delete defaultProperties.id;
      delete overrides.id;
      return this;
    },

    doesntExistId() {
      overrides.id = '1e72ef98-f21e-4e0a-aff1-a45ed7328123';
      delete defaultProperties.id;
      delete overrides.id;
      return this;
    },

    fromSource(source: ParticipantSource) {
      overrides.id = source.id;
      return this;
    },

    build(): Participant {
      return Participant.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): Participant {
      return {
        ...defaultProperties,
        ...overrides,
      } as Participant;
    },

    // buildCreateParticipantDto(): CreateParticipantDto {
    //   const build = this.build();
    //   return {
    //     id: build.id,
    //     source: build.source,
    //   } as CreateParticipantDto;
    // },

    // buildCreateParticipantRequestDto(): CreateParticipantRequestDto {
    //   return {
    //     id: this.buildNoCheck().id,
    //   } as CreateParticipantRequestDto;
    // },

    buildFindByIdParticipantDto(): FindParticipantDto {
      return {
        identifier: 'id',
        value: this.build().id,
      } as FindParticipantDto;
    },

    buildFindByIdSourceValueParticipantDto(): FindParticipantDto {
      const sourceId = this.build().sourceIds[0];
      return {
        identifier: 'idSourceValue',
        value: prepareExternalIdSourceValue(sourceId.id, sourceId.source),
      } as FindParticipantDto;
    },

    buildFindByIdParticipantRequestDto(): FindByIdParticipantRequestDto {
      return {
        id: this.buildNoCheck().id,
      } as FindByIdParticipantRequestDto;
    },

    // buildFindByIdSourceValueParticipantRequestDto(): FindByIdSourceValueParticipantRequestDto {
    //   const sourceId = this.build().sourceIds[0];
    //   return {
    //     idSourceValue: sourceId.id,
    //   } as FindByIdSourceValueParticipantRequestDto;
    // },

    buildUpdateParticipantDto(): UpdateParticipantDto {
      return {
        id: this.build().id,
      } as UpdateParticipantDto;
    },

    buildUpdateParticipantRequestDto(): UpdateParticipantRequestDto {
      return {
        id: this.buildNoCheck().id,
      } as UpdateParticipantRequestDto;
    },

    buildParticipantResponseDto(): ParticipantResponseDto {
      return {
        ...defaultProperties,
        ...overrides,
      } as ParticipantResponseDto;
    },
  };
};
