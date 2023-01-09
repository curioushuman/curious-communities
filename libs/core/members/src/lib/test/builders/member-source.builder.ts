import { ExternalId, prepareExternalIdSourceValue } from '@curioushuman/common';
import { CreateMemberSourceDto } from '../../application/commands/create-member-source/create-member-source.dto';
import { UpdateMemberSourceDto } from '../../application/commands/update-member-source/update-member-source.dto';
import { FindMemberSourceDto } from '../../application/queries/find-member-source/find-member-source.dto';

import { MemberSource } from '../../domain/entities/member-source';
import { MemberName } from '../../domain/value-objects/member-name';
import { MemberSourceStatus } from '../../domain/value-objects/member-source-status';
import {
  FindByEmailMemberSourceRequestDto,
  FindByIdSourceValueMemberSourceRequestDto,
} from '../../infra/find-member-source/dto/find-member-source.request.dto';
import { UpsertMemberSourceRequestDto } from '../../infra/upsert-member-source/dto/upsert-member-source.request.dto';
import config from '../../static/config';
import { MemberBuilder } from './member.builder';

/**
 * A builder for Member Sources to play with in testing.
 */

/**
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

/**
 * This is basically a looser mimic of Member
 * For the purpose of being able to create invalid Members & DTOs and such
 */
type MemberSourceLooseMimic = {
  [K in keyof MemberSource]?: MemberSource[K] | string | number;
};

export const MemberSourceBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: MemberSourceLooseMimic = {
    id: '5008s1234519CjIPPU',
    status: 'pending' as MemberSourceStatus,

    name: 'James Brown',
    email: 'james@brown.com',
    organisationName: 'James Co',
  };
  const overrides: MemberSourceLooseMimic = {
    id: defaultProperties.id,
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
      overrides.email = 'jim@brown.com';
      return this;
    },

    beta() {
      overrides.id = '5008s000000y7LUAAY';
      overrides.name = 'June Brown';
      overrides.email = 'june@brown.com';
      return this;
    },

    alternateSource() {
      source = 'AUTH';
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
      overrides.status = 'this is invalid';
      return this;
    },

    invalidSource() {
      overrides.name = '';
      return this;
    },

    exists() {
      overrides.id = ExternalId.check('ThisSourceExists');
      overrides.name = 'Jade Green';
      overrides.email = 'jade@green.com';
      return this;
    },

    updated() {
      overrides.id = ExternalId.check('ThisSourceExists');
      overrides.name = 'Jade Green';
      overrides.email = 'jade@green.com';
      overrides.status = 'registered';
      return this;
    },

    build(): MemberSource {
      return MemberSource.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): MemberSource {
      return {
        ...defaultProperties,
        ...overrides,
      } as MemberSource;
    },

    buildFindByIdSourceValueMemberSourceDto(): FindMemberSourceDto {
      const build = this.buildNoCheck();
      return {
        identifier: 'idSource',
        value: {
          id: build.id,
          source,
        },
      } as FindMemberSourceDto;
    },

    buildFindByIdSourceValueMemberSourceRequestDto(): FindByIdSourceValueMemberSourceRequestDto {
      const build = this.buildNoCheck();
      return {
        idSourceValue: prepareExternalIdSourceValue(build.id, source),
      } as FindByIdSourceValueMemberSourceRequestDto;
    },

    buildFindByEmailMemberSourceDto(): FindMemberSourceDto {
      return {
        identifier: 'email',
        value: this.buildNoCheck().email,
      } as FindMemberSourceDto;
    },

    buildFindByEmailMemberSourceRequestDto(): FindByEmailMemberSourceRequestDto {
      return {
        email: this.buildNoCheck().email,
      } as FindByEmailMemberSourceRequestDto;
    },

    buildCreateMemberSourceDto(): CreateMemberSourceDto {
      const member = MemberBuilder().noSourceExists().buildNoCheck();
      return {
        source: config.defaults.primaryAccountSource,
        member,
      } as CreateMemberSourceDto;
    },

    buildCreateUpsertMemberSourceRequestDto(): UpsertMemberSourceRequestDto {
      const member = MemberBuilder().noSourceExists().buildMemberResponseDto();
      return {
        source: config.defaults.primaryAccountSource,
        member,
      } as UpsertMemberSourceRequestDto;
    },

    buildInvalidCreateMemberSourceDto(): CreateMemberSourceDto {
      const member = MemberBuilder().noSourceExists().buildNoCheck();
      member.name = '' as MemberName;
      return {
        source: config.defaults.primaryAccountSource,
        member,
      } as CreateMemberSourceDto;
    },

    buildInvalidUpsertMemberSourceRequestDto(): UpsertMemberSourceRequestDto {
      const member = MemberBuilder().exists().buildMemberResponseDto();
      member.name = '' as MemberName;
      return {
        source: config.defaults.primaryAccountSource,
        member,
      } as UpsertMemberSourceRequestDto;
    },

    buildUpdateMemberSourceDto(): UpdateMemberSourceDto {
      const member = MemberBuilder().updated().buildNoCheck();
      const memberSource = this.exists().buildNoCheck();
      return {
        source: config.defaults.primaryAccountSource,
        member,
        memberSource,
      } as UpdateMemberSourceDto;
    },

    buildUpdateUpsertMemberSourceRequestDto(): UpsertMemberSourceRequestDto {
      const member = MemberBuilder().exists().buildMemberResponseDto();
      return {
        source: config.defaults.primaryAccountSource,
        member,
      } as UpsertMemberSourceRequestDto;
    },

    buildUpdateByEmailUpsertMemberSourceRequestDto(): UpsertMemberSourceRequestDto {
      const member = MemberBuilder().exists().buildMemberResponseDto();
      member.sourceIds = [];
      return {
        source: config.defaults.primaryAccountSource,
        member,
      } as UpsertMemberSourceRequestDto;
    },

    buildInvalidUpdateMemberSourceDto(): UpdateMemberSourceDto {
      const member = MemberBuilder().exists().buildNoCheck();
      const memberSource = this.exists().buildNoCheck();
      member.name = '' as MemberName;
      return {
        source: config.defaults.primaryAccountSource,
        member,
        memberSource,
      } as UpdateMemberSourceDto;
    },
  };
};
