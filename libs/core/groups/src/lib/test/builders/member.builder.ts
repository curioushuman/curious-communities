import { prepareExternalIdSourceValue } from '@curioushuman/common';
import { Member } from '../../domain/entities/member';
import config from '../../static/config';
import { MemberDto } from '../../infra/dto/member.dto';
import { MemberStatusEnum } from '../../domain/value-objects/member-status';
import { MemberSource } from '../../domain/value-objects/member-source';

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
    status: MemberStatusEnum.PENDING,
    sourceOrigin: 'CRM' as MemberSource,
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
    sourceOrigin: defaultProperties.sourceOrigin,
    sourceIds: defaultProperties.sourceIds,

    name: defaultProperties.name,
    email: defaultProperties.email,
    organisationName: defaultProperties.organisationName,

    accountOwner: defaultProperties.accountOwner,
  };

  return {
    alpha() {
      overrides.name = 'Alpha Brown';
      overrides.email = 'alpha@email.com';
      return this;
    },

    beta() {
      overrides.name = 'Beta Brown';
      overrides.email = 'beta@email.com';
      return this;
    },

    exists() {
      overrides.id = '4bc22e84-8b56-4b82-b6cd-44864792526e';
      overrides.email = 'exists@email.com';
      overrides.sourceIds = [
        {
          id: 'ThisSourceExists',
          source: config.defaults.primaryAccountSource,
        },
      ];
      return this;
    },

    updated() {
      overrides.id = '91a850b9-a6eb-4020-acf6-b09b296a8ac2';
      overrides.email = 'updated@email.com';
      overrides.sourceIds = [
        {
          id: 'ThisSourceUsedForUpdating',
          source: config.defaults.primaryAccountSource,
        },
      ];
      return this;
    },

    doesntExist() {
      overrides.id = '91a850b9-a6eb-4020-acf6-b09b296a8ac3';
      overrides.sourceIds = [
        {
          id: 'NoExisty',
          source: config.defaults.primaryAccountSource,
        },
      ];
      overrides.id = '3afa5c00-9c60-4077-96ee-75c1b25c8a1a';
      return this;
    },

    invalid() {
      overrides.id = '';
      return this;
    },

    build(): Member {
      return this.buildNoCheck();
    },

    buildNoCheck(): Member {
      return {
        ...defaultProperties,
        ...overrides,
      } as Member;
    },

    buildDto(): MemberDto {
      const member = this.build();
      return {
        ...member,
        sourceIds: member.sourceIds.map((idSource) =>
          prepareExternalIdSourceValue(idSource.id, idSource.source)
        ),
      } as MemberDto;
    },
  };
};
