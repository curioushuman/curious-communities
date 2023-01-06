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
import { ParticipantSourceStatus } from '../../domain/value-objects/participant-source-status';

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
    id: '6fce9d10-aeed-4bb1-8c8c-92094f1982ff',
    memberId: 'bd4dfd87-70c1-4a6f-b590-b3bbfce99f51',
    courseId: '5aad9387-2bfb-4391-82b3-8501a4fca58e',
    status: 'pending' as ParticipantStatus,

    sourceIds: [
      {
        id: '5008s1234519CjIPPU',
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
    setSource(source: ParticipantSource) {
      overrides.sourceIds = [
        {
          id: source.id,
          source: 'COURSE',
        },
      ];
    },

    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = ParticipantSourceBuilder().alpha().buildNoCheck();
      this.setSource(source);
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = ParticipantSourceBuilder().beta().buildNoCheck();
      this.setSource(source);
      return this;
    },

    invalidSource() {
      const source = ParticipantSourceBuilder().invalidSource().buildNoCheck();
      this.setSource(source);
      return this;
    },

    invalidStatus() {
      const source = ParticipantSourceBuilder().invalidStatus().buildNoCheck();
      this.setSource(source);
      return this;
    },

    noMatchingSource() {
      overrides.sourceIds = [
        {
          id: 'NothingCanBeFoundForThis',
          source: 'COURSE',
        },
      ];
      return this;
    },

    invalid() {
      overrides.sourceIds = [
        {
          id: 'ThisIsMeaningless',
          source: 'THISISSOINVALIDRIGHTNOW',
        },
      ];
      return this;
    },

    invalidOther() {
      overrides.status = 'happy';
      return this;
    },

    exists() {
      const source = ParticipantSourceBuilder().exists().build();
      this.setSource(source);
      return this;
    },

    doesntExist() {
      overrides.id = '9f7aeaf9-b258-4099-b23b-6c0e48c52a34';
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
      this.setSource(source);
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

    buildCreateParticipantDto(): CreateParticipantDto {
      const build = this.buildNoCheck();
      return {
        participantSource: {
          id: build.sourceIds[0].id,
          status: build.status as ParticipantSourceStatus,
        },
        course: {
          id: build.courseId,
        },
        member: {
          id: build.memberId,
          email: build.memberEmail,
          name: build.memberName,
          organisationName: build.memberOrganisationName,
        },
      } as CreateParticipantDto;
    },

    buildCreateParticipantRequestDto(): CreateParticipantRequestDto {
      const build = this.buildNoCheck();
      return {
        participantSource: {
          id: build.sourceIds[0].id,
          status: build.status,
        },
        course: {
          id: build.courseId,
        },
        member: {
          id: build.memberId,
          email: build.memberEmail,
          name: build.memberName,
          organisationName: build.memberOrganisationName,
        },
      } as CreateParticipantRequestDto;
    },

    buildFindByIdParticipantDto(): FindParticipantDto {
      return {
        identifier: 'id',
        value: this.buildNoCheck().id,
      } as FindParticipantDto;
    },

    buildFindByIdSourceValueParticipantDto(): FindParticipantDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
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

    buildFindByIdSourceValueParticipantRequestDto(): FindByIdSourceValueParticipantRequestDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        idSourceValue: prepareExternalIdSourceValue(
          sourceId.id,
          sourceId.source
        ),
      } as FindByIdSourceValueParticipantRequestDto;
    },

    buildUpdateParticipantDto(): UpdateParticipantDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return sourceId as UpdateParticipantDto;
    },

    buildUpdateParticipantRequestDto(): UpdateParticipantRequestDto {
      const sourceIds = this.buildNoCheck().sourceIds;
      if (!sourceIds) {
        return {
          idSourceValue: '',
        } as UpdateParticipantRequestDto;
      }
      return {
        idSourceValue: prepareExternalIdSourceValue(
          sourceIds[0].id,
          sourceIds[0].source
        ),
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
