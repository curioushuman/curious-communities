import { ExternalId, prepareExternalIdSourceValue } from '@curioushuman/common';
import { FindMemberSourceDto } from '../../application/queries/find-member-source/find-member-source.dto';

import { MemberSource } from '../../domain/entities/member-source';
import { MemberSourceStatus } from '../../domain/value-objects/member-source-status';
import {
  FindByEmailMemberSourceRequestDto,
  FindByIdSourceValueMemberSourceRequestDto,
} from '../../infra/find-member-source/dto/find-member-source.request.dto';
import config from '../../static/config';

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
      return this;
    },

    updated() {
      overrides.id = ExternalId.check('ThisSourceExists');
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

    buildFindByIdSourceValueMemberDto(): FindMemberSourceDto {
      const build = this.buildNoCheck();
      return {
        identifier: 'idSource',
        value: {
          id: build.id,
          source,
        },
      } as FindMemberSourceDto;
    },

    buildFindByIdSourceValueMemberRequestDto(): FindByIdSourceValueMemberSourceRequestDto {
      const build = this.buildNoCheck();
      return {
        idSourceValue: prepareExternalIdSourceValue(build.id, source),
      } as FindByIdSourceValueMemberSourceRequestDto;
    },

    buildFindByEmailMemberDto(): FindMemberSourceDto {
      return {
        identifier: 'email',
        value: this.buildNoCheck().email,
      } as FindMemberSourceDto;
    },

    buildFindByEmailMemberRequestDto(): FindByEmailMemberSourceRequestDto {
      return {
        email: this.buildNoCheck().email,
      } as FindByEmailMemberSourceRequestDto;
    },
  };
};
