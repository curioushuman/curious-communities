import { Member } from '../../domain/entities/member';
import config from '../../static/config';
import {
  MemberStatus,
  MemberStatusEnum,
} from '../../domain/value-objects/member-status';
import { MemberDto } from '../../infra/dto/member.dto';
import { prepareExternalIdSourceValue } from '@curioushuman/common';

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
    status: MemberStatusEnum.PENDING as MemberStatus,

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
    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      overrides.name = 'Alpha Brown';
      overrides.email = 'alpha@email.com';
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      overrides.name = 'Beta Brown';
      overrides.email = 'beta@email.com';
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
