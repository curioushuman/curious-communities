import { Member } from '../../domain/entities/member';
import { MemberSource } from '../../domain/entities/member-source';
import { MemberResponseDto } from '../../infra/dto/member.response.dto';
import {
  CreateByEmailMemberRequestDto,
  CreateByIdSourceValueMemberRequestDto,
} from '../../infra/create-member/dto/create-member.request.dto';
import { CreateMemberDto } from '../../application/commands/create-member/create-member.dto';
import { MemberSourceBuilder } from './member-source.builder';
import config from '../../static/config';
import { MemberStatus } from '../../domain/value-objects/member-status';
import { UpdateMemberRequestDto } from '../../infra/update-member/dto/update-member.request.dto';
import { UpdateMemberDto } from '../../application/commands/update-member/update-member.dto';
import { FindMemberDto } from '../../application/queries/find-member/find-member.dto';
import {
  FindByEmailMemberRequestDto,
  FindByIdMemberRequestDto,
  FindByIdSourceValueMemberRequestDto,
} from '../../infra/find-member/dto/find-member.request.dto';
import { prepareExternalIdSourceValue } from '@curioushuman/common';
import { MemberSourceIdSource } from '../../domain/value-objects/member-source-id-source';

/**
 * A builder for Members to play with in testing.
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
 * This is basically a looser mimic of Member
 * For the purpose of being able to create invalid Members & DTOs and such
 */
type MemberLooseMimic = {
  [K in keyof Member]?: Member[K] | string | number | object;
};

export const MemberBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: MemberLooseMimic = {
    id: '6fce9d10-aeed-4bb1-8c8c-92094f1982ff',
    status: 'pending' as MemberStatus,

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
  const overrides: MemberLooseMimic = {
    id: defaultProperties.id,
    status: defaultProperties.status,

    sourceIds: defaultProperties.sourceIds,

    name: defaultProperties.name,
    email: defaultProperties.email,
    organisationName: defaultProperties.organisationName,

    accountOwner: defaultProperties.accountOwner,
  };

  return {
    setSource(source: MemberSource) {
      overrides.sourceIds = [
        {
          id: source.id,
          source: config.defaults.primaryAccountSource,
        },
      ];
    },

    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = MemberSourceBuilder().alpha().buildNoCheck();
      this.setSource(source);
      overrides.email = source.email;
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = MemberSourceBuilder().beta().buildNoCheck();
      this.setSource(source);
      overrides.email = source.email;
      return this;
    },

    invalidSource() {
      const source = MemberSourceBuilder().invalidSource().buildNoCheck();
      this.setSource(source);
      return this;
    },

    invalidStatus() {
      const source = MemberSourceBuilder().invalidStatus().buildNoCheck();
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

    noSourceExists() {
      overrides.name = 'NOT FOUND';
      overrides.email = 'not@found.com';
      overrides.sourceIds = [];
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
      const source = MemberSourceBuilder().exists().build();
      this.setSource(source);
      overrides.name = source.name;
      overrides.email = source.email;
      return this;
    },

    updated() {
      const source = MemberSourceBuilder().updated().build();
      this.setSource(source);
      overrides.status = source.status;
      overrides.name = source.name;
      overrides.email = source.email;
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

    fromSource(source: MemberSource) {
      this.setSource(source);
      return this;
    },

    build(): Member {
      return Member.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): Member {
      return {
        ...defaultProperties,
        ...overrides,
      } as Member;
    },

    buildCreateByIdSourceValueMemberDto(): CreateMemberDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        findMemberDto: {
          identifier: 'idSourceValue',
          value: prepareExternalIdSourceValue(sourceId.id, sourceId.source),
        },
        findMemberSourceDto: {
          identifier: 'idSource',
          value: sourceId,
        },
      } as CreateMemberDto;
    },

    buildCreateByIdSourceValueMemberRequestDto(): CreateByIdSourceValueMemberRequestDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        idSourceValue: prepareExternalIdSourceValue(
          sourceId.id,
          sourceId.source
        ),
      } as CreateByIdSourceValueMemberRequestDto;
    },

    buildCreateByEmailMemberDto(): CreateMemberDto {
      const value = this.buildNoCheck().email;
      return {
        findMemberDto: {
          identifier: 'email',
          value,
        },
        findMemberSourceDto: {
          identifier: 'email',
          value,
        },
      } as CreateMemberDto;
    },

    buildCreateByEmailMemberRequestDto(): CreateByEmailMemberRequestDto {
      return {
        email: this.buildNoCheck().email,
      } as CreateByEmailMemberRequestDto;
    },

    buildFindByIdMemberDto(): FindMemberDto {
      return {
        identifier: 'id',
        value: this.buildNoCheck().id,
      } as FindMemberDto;
    },

    buildFindByIdMemberRequestDto(): FindByIdMemberRequestDto {
      return {
        id: this.buildNoCheck().id,
      } as FindByIdMemberRequestDto;
    },

    buildFindByIdSourceValueMemberDto(): FindMemberDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        identifier: 'idSourceValue',
        value: prepareExternalIdSourceValue(sourceId.id, sourceId.source),
      } as FindMemberDto;
    },

    buildFindByIdSourceValueMemberRequestDto(): FindByIdSourceValueMemberRequestDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        idSourceValue: prepareExternalIdSourceValue(
          sourceId.id,
          sourceId.source
        ),
      } as FindByIdSourceValueMemberRequestDto;
    },

    buildFindByEmailMemberDto(): FindMemberDto {
      return {
        identifier: 'email',
        value: this.buildNoCheck().email,
      } as FindMemberDto;
    },

    buildFindByEmailMemberRequestDto(): FindByEmailMemberRequestDto {
      return {
        email: this.buildNoCheck().email,
      } as FindByEmailMemberRequestDto;
    },

    buildUpdateMemberDto(): UpdateMemberDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return sourceId as UpdateMemberDto;
    },

    buildUpdateMemberRequestDto(): UpdateMemberRequestDto {
      const sourceIds = this.buildNoCheck().sourceIds;
      if (!sourceIds) {
        return {
          idSourceValue: '',
        } as UpdateMemberRequestDto;
      }
      return {
        idSourceValue: prepareExternalIdSourceValue(
          sourceIds[0].id,
          sourceIds[0].source
        ),
      } as UpdateMemberRequestDto;
    },

    buildMemberResponseDto(): MemberResponseDto {
      const sourceIds = overrides.sourceIds as MemberSourceIdSource[];
      return MemberResponseDto.check({
        ...defaultProperties,
        ...overrides,
        sourceIds: sourceIds.map((idSource) =>
          prepareExternalIdSourceValue(idSource.id, idSource.source)
        ),
      });
    },
  };
};
