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

    buildCreateParticipantDto(): CreateParticipantDto {
      return {
        id: this.build().id,
      } as CreateParticipantDto;
    },

    buildCreateParticipantRequestDto(): CreateParticipantRequestDto {
      return {
        id: this.buildNoCheck().id,
      } as CreateParticipantRequestDto;
    },

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
