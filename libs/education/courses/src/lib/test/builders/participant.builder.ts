import {
  Participant,
  ParticipantBase,
} from '../../domain/entities/participant';
import { ParticipantSource } from '../../domain/entities/participant-source';
import {
  ParticipantBaseResponseDto,
  ParticipantResponseDto,
} from '../../infra/dto/participant.response.dto';
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
import { CourseBuilder } from './course.builder';
import { ParticipantSourceIdSource } from '../../domain/value-objects/participant-source-id-source';
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
        source: config.defaults.primaryAccountSource,
      },
    ],

    name: 'James Brown',
    email: 'james@brown.com',
    organisationName: 'James Co',

    accountOwner: config.defaults.accountOwner,
  };
  const overrides: ParticipantLooseMimic = {
    id: defaultProperties.id,
    memberId: defaultProperties.memberId,
    courseId: defaultProperties.courseId,
    status: defaultProperties.status,

    sourceIds: defaultProperties.sourceIds,

    name: defaultProperties.name,
    email: defaultProperties.email,
    organisationName: defaultProperties.organisationName,

    accountOwner: defaultProperties.accountOwner,
  };

  return {
    setSource(source: ParticipantSource) {
      overrides.sourceIds = [
        {
          id: source.id,
          source: config.defaults.primaryAccountSource,
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
          source: config.defaults.primaryAccountSource,
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
      overrides.id = '1e72ef98-f21e-4e0a-aff1-a45ed7328456';
      return this;
    },

    exists() {
      const source = ParticipantSourceBuilder().exists().build();
      this.setSource(source);
      return this;
    },

    updated() {
      const source = ParticipantSourceBuilder().updated().build();
      this.setSource(source);
      return this;
    },

    doesntExist() {
      const source = ParticipantSourceBuilder().doesntExist().build();
      this.setSource(source);
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

    buildBase(): ParticipantBase {
      return ParticipantBase.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildBaseNoCheck(): Participant {
      const participant = {
        ...defaultProperties,
        ...overrides,
      };
      return participant as Participant;
    },

    build(): Participant {
      const participantBase = ParticipantBase.check({
        ...defaultProperties,
        ...overrides,
      });
      const course = CourseBuilder().exists().buildBase();
      // the above two checks are sufficient
      const p = {
        ...participantBase,
        course,
      } as Participant;
      console.log('p', p);
      return p as Participant;
    },

    buildNoCheck(): Participant {
      const participant = {
        ...defaultProperties,
        ...overrides,
      };
      participant.course = CourseBuilder().exists().buildBase();
      return participant as Participant;
    },

    buildCreateParticipantDto(): CreateParticipantDto {
      const build = this.buildBaseNoCheck();
      console.log('build', build);
      const participantSource = ParticipantSourceBuilder().exists().build();
      const course = CourseBuilder().exists().buildBaseNoCheck();
      // supports the invalid request tests
      participantSource.status = build.status as ParticipantSourceStatus;
      return {
        participantSource,
        course,
        member: {
          id: build.memberId,
          email: build.email,
          name: build.name,
          organisationName: build.organisationName,
        },
      } as CreateParticipantDto;
    },

    buildCreateParticipantRequestDto(): CreateParticipantRequestDto {
      const build = this.buildBaseNoCheck();
      const participantSource = ParticipantSourceBuilder()
        .exists()
        .buildParticipantSourceResponseDto();
      const course = CourseBuilder().exists().buildCourseBaseResponseDto();
      // this supports the invalid request tests
      participantSource.status = build.status;
      return {
        participantSource,
        course,
        member: {
          id: build.memberId,
          email: build.email,
          name: build.name,
          organisationName: build.organisationName,
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

    buildUpdateParticipantDto(ps?: ParticipantSource): UpdateParticipantDto {
      // default is successful path
      const participantSource =
        ps || ParticipantSourceBuilder().updated().build();
      const participant = this.buildNoCheck();
      return { participantSource, participant } as UpdateParticipantDto;
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

    buildParticipantBaseResponseDto(): ParticipantBaseResponseDto {
      const sourceIds = overrides.sourceIds as ParticipantSourceIdSource[];
      const dto = {
        ...defaultProperties,
        ...overrides,
        sourceIds: sourceIds.map((idSource) =>
          prepareExternalIdSourceValue(idSource.id, idSource.source)
        ),
      };
      delete dto.course;
      return dto as ParticipantBaseResponseDto;
    },

    buildParticipantResponseDto(): ParticipantResponseDto {
      const sourceIds = overrides.sourceIds as ParticipantSourceIdSource[];
      const courseResponseDto = CourseBuilder()
        .exists()
        .buildCourseBaseResponseDto();
      const dto = {
        ...defaultProperties,
        ...overrides,
        sourceIds: sourceIds.map((idSource) =>
          prepareExternalIdSourceValue(idSource.id, idSource.source)
        ),
        course: courseResponseDto,
      };
      return dto as ParticipantResponseDto;
    },
  };
};
