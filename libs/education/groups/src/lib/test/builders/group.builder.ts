import { createYearMonth, Timestamp } from '@curioushuman/common';

import { Group } from '../../domain/entities/group';
import { GroupSource } from '../../domain/entities/group-source';
import { GroupResponseDto } from '../../infra/dto/group.response.dto';
import { CreateGroupRequestDto } from '../../infra/create-group/dto/create-group.request.dto';
import { CreateGroupDto } from '../../application/commands/create-group/create-group.dto';
import { GroupSourceBuilder } from './group-source.builder';
import config from '../../static/config';
import { createGroupSlug } from '../../domain/value-objects/group-slug';
import { GroupStatus } from '../../domain/value-objects/group-status';
import { UpdateGroupRequestDto } from '../../infra/update-group/dto/update-group.request.dto';
import { UpdateGroupDto } from '../../application/commands/update-group/update-group.dto';

/**
 * A builder for Groups to play with in testing.
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
 * This is basically a looser mimic of Group
 * For the purpose of being able to create invalid Groups & DTOs and such
 */
type GroupLooseMimic = {
  [K in keyof Group]?: Group[K] | string | number | object;
};

// timestamps used below
const timestamps: number[] = [];
const dateAgo = new Date();
for (let i = 0; i <= 3; i++) {
  dateAgo.setMonth(dateAgo.getMonth() - i);
  timestamps.push(dateAgo.getTime());
}

export const GroupBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: GroupLooseMimic = {
    id: '5008s1234519CjIAAU',
    status: 'open' as GroupStatus,
    slug: 'learn_to_be_a_dancer',
    supportType: config.defaults.groupSupportType,
    name: 'Learn to be a dancer',
    dateOpen: timestamps[2],
    dateClosed: timestamps[0],
    yearMonthOpen: createYearMonth(timestamps[2] as Timestamp),
    accountOwner: config.defaults.accountOwner,
  };
  const overrides: GroupLooseMimic = {
    id: defaultProperties.id,
    status: defaultProperties.status,
    slug: defaultProperties.slug,
    supportType: defaultProperties.supportType,
    name: defaultProperties.name,
    dateOpen: defaultProperties.dateOpen,
    dateClosed: defaultProperties.dateClosed,
    yearMonthOpen: defaultProperties.yearMonthOpen,
    accountOwner: defaultProperties.accountOwner,
  };

  return {
    funkyChars() {
      const source = GroupSourceBuilder().funkyChars().buildNoCheck();
      overrides.name = source.name;
      overrides.slug = createGroupSlug(source);
      return this;
    },

    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = GroupSourceBuilder().alpha().buildNoCheck();
      overrides.id = source.id;
      overrides.name = source.name;
      overrides.slug = createGroupSlug(source);
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = GroupSourceBuilder().beta().buildNoCheck();
      overrides.id = source.id;
      overrides.name = source.name;
      overrides.slug = createGroupSlug(source);
      return this;
    },

    invalidSource() {
      const source = GroupSourceBuilder().invalidSource().buildNoCheck();
      overrides.id = source.id;
      overrides.slug = createGroupSlug(source);
      return this;
    },

    invalidStatus() {
      const source = GroupSourceBuilder().invalidStatus().buildNoCheck();
      overrides.id = source.id;
      overrides.slug = createGroupSlug(source);
      return this;
    },

    noMatchingSource() {
      overrides.id = 'NoMatchingSource';
      return this;
    },

    invalid() {
      delete defaultProperties.id;
      delete overrides.id;
      delete defaultProperties.slug;
      delete overrides.slug;
      return this;
    },

    exists() {
      const source = GroupSourceBuilder().exists().build();
      overrides.id = source.id;
      overrides.slug = createGroupSlug(source);
      return this;
    },

    doesntExist() {
      overrides.id = 'GroupDoesntExist';
      overrides.slug = 'group-doesnt-exist';
      delete defaultProperties.id;
      delete overrides.id;
      return this;
    },

    doesntExistId() {
      overrides.id = '1e72ef98-f21e-4e0a-aff1-a45ed7328123';
      delete defaultProperties.id;
      delete overrides.id;
      delete defaultProperties.slug;
      delete overrides.slug;
      return this;
    },

    fromSource(source: GroupSource) {
      overrides.id = source.id;
      overrides.name = source.name;
      overrides.slug = createGroupSlug(source);
      return this;
    },

    build(): Group {
      return Group.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): Group {
      return {
        ...defaultProperties,
        ...overrides,
      } as Group;
    },

    buildCreateGroupDto(): CreateGroupDto {
      return {
        id: this.build().id,
      } as CreateGroupDto;
    },

    buildCreateGroupRequestDto(): CreateGroupRequestDto {
      return {
        id: this.buildNoCheck().id,
      } as CreateGroupRequestDto;
    },

    buildUpdateGroupDto(): UpdateGroupDto {
      return {
        id: this.build().id,
      } as UpdateGroupDto;
    },

    buildUpdateGroupRequestDto(): UpdateGroupRequestDto {
      return {
        id: this.buildNoCheck().id,
      } as UpdateGroupRequestDto;
    },

    buildGroupResponseDto(): GroupResponseDto {
      return {
        ...defaultProperties,
        ...overrides,
      } as GroupResponseDto;
    },
  };
};
