import { Member } from '../../domain/entities/member';
import { MemberSource } from '../../domain/entities/member-source';
import { MemberResponseDto } from '../../infra/dto/member.response.dto';
import { CreateMemberRequestDto } from '../../infra/create-member/dto/create-member.request.dto';
import { CreateMemberDto } from '../../application/commands/create-member/create-member.dto';
import { MemberSourceBuilder } from './member-source.builder';
import config from '../../static/config';
import { createMemberSlug } from '../../domain/value-objects/member-slug';
import { MemberStatus } from '../../domain/value-objects/member-status';
import { UpdateMemberRequestDto } from '../../infra/update-member/dto/update-member.request.dto';
import { UpdateMemberDto } from '../../application/commands/update-member/update-member.dto';

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
    externalId: '5008s1234519CjIAAU',
    status: 'open' as MemberStatus,
    slug: 'james_brown',
    name: 'James Brown',
    email: 'james@brown.co',
    organisationName: 'Brown Co',
    accountOwner: config.defaults.accountOwner,
  };
  const overrides: MemberLooseMimic = {
    externalId: defaultProperties.externalId,
    status: defaultProperties.status,
    slug: defaultProperties.slug,
    name: defaultProperties.name,
    email: defaultProperties.email,
    organisationName: defaultProperties.organisationName,
    accountOwner: defaultProperties.accountOwner,
  };

  return {
    funkyChars() {
      const source = MemberSourceBuilder().funkyChars().buildNoCheck();
      overrides.name = source.name;
      overrides.slug = createMemberSlug(source);
      return this;
    },

    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = MemberSourceBuilder().alpha().buildNoCheck();
      overrides.externalId = source.id;
      overrides.name = source.name;
      overrides.slug = createMemberSlug(source);
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = MemberSourceBuilder().beta().buildNoCheck();
      overrides.externalId = source.id;
      overrides.name = source.name;
      overrides.slug = createMemberSlug(source);
      return this;
    },

    invalidSource() {
      const source = MemberSourceBuilder().invalidSource().buildNoCheck();
      overrides.externalId = source.id;
      return this;
    },

    invalidStatus() {
      const source = MemberSourceBuilder().invalidStatus().buildNoCheck();
      overrides.externalId = source.id;
      overrides.slug = createMemberSlug(source);
      return this;
    },

    noMatchingSource() {
      overrides.externalId = 'NoMatchingSource';
      return this;
    },

    invalid() {
      delete defaultProperties.externalId;
      delete overrides.externalId;
      delete defaultProperties.slug;
      delete overrides.slug;
      return this;
    },

    exists() {
      const source = MemberSourceBuilder().exists().build();
      overrides.externalId = source.id;
      overrides.slug = createMemberSlug(source);
      return this;
    },

    doesntExist() {
      overrides.externalId = 'MemberDoesntExist';
      overrides.slug = 'member-doesnt-exist';
      delete defaultProperties.externalId;
      delete overrides.externalId;
      return this;
    },

    doesntExistId() {
      overrides.externalId = '1e72ef98-f21e-4e0a-aff1-a45ed7328123';
      delete defaultProperties.externalId;
      delete overrides.externalId;
      delete defaultProperties.slug;
      delete overrides.slug;
      return this;
    },

    fromSource(source: MemberSource) {
      overrides.externalId = source.id;
      overrides.name = source.name;
      overrides.slug = createMemberSlug(source);
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

    buildCreateMemberDto(): CreateMemberDto {
      return {
        externalId: this.build().externalId,
      } as CreateMemberDto;
    },

    buildCreateMemberRequestDto(): CreateMemberRequestDto {
      return {
        externalId: this.buildNoCheck().externalId,
      } as CreateMemberRequestDto;
    },

    buildUpdateMemberDto(): UpdateMemberDto {
      return {
        externalId: this.build().externalId,
      } as UpdateMemberDto;
    },

    buildUpdateMemberRequestDto(): UpdateMemberRequestDto {
      return {
        externalId: this.buildNoCheck().externalId,
      } as UpdateMemberRequestDto;
    },

    buildMemberResponseDto(): MemberResponseDto {
      return {
        ...defaultProperties,
        ...overrides,
      } as MemberResponseDto;
    },
  };
};
