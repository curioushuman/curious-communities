import { Group } from '../../domain/entities/group';
import { GroupSource } from '../../domain/entities/group-source';
import { GroupResponseDto } from '../../infra/dto/group.response.dto';
import { CreateByIdSourceValueGroupRequestDto } from '../../infra/create-group/dto/create-group.request.dto';
import { CreateGroupDto } from '../../application/commands/create-group/create-group.dto';
import { GroupSourceBuilder } from './group-source.builder';
import config from '../../static/config';
import { GroupStatus } from '../../domain/value-objects/group-status';
import { UpdateGroupRequestDto } from '../../infra/update-group/dto/update-group.request.dto';
import { UpdateGroupDto } from '../../application/commands/update-group/update-group.dto';
import { FindGroupDto } from '../../application/queries/find-group/find-group.dto';
import {
  FindByIdGroupRequestDto,
  FindByIdSourceValueGroupRequestDto,
  FindBySlugGroupRequestDto,
} from '../../infra/find-group/dto/find-group.request.dto';
import { prepareExternalIdSourceValue } from '@curioushuman/common';
import { GroupSourceIdSource } from '../../domain/value-objects/group-source-id-source';
import { GroupType } from '../../domain/value-objects/group-type';

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

export const GroupBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties: GroupLooseMimic = {
    id: '6fce9d10-aeed-4bb1-8c8c-92094f1982ff',
    status: 'pending' as GroupStatus,
    type: config.defaults.groupType as GroupType,
    slug: 'brown-group',

    sourceIds: [
      {
        id: '5008s1234519CjIPPU',
        source: config.defaults.primaryAccountSource,
      },
    ],

    name: 'Brown group',

    accountOwner: config.defaults.accountOwner,
  };
  const overrides: GroupLooseMimic = {
    id: defaultProperties.id,
    status: defaultProperties.status,
    type: defaultProperties.type,
    slug: defaultProperties.slug,

    sourceIds: defaultProperties.sourceIds,

    name: defaultProperties.name,

    accountOwner: defaultProperties.accountOwner,
  };

  return {
    setSource(source: GroupSource) {
      overrides.sourceIds = [
        {
          id: source.id,
          source: config.defaults.primaryAccountSource,
        },
      ];
    },

    alpha() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = GroupSourceBuilder().alpha().buildNoCheck();
      this.setSource(source);
      overrides.name = source.name;
      return this;
    },

    beta() {
      // ID DOES NOT EXIST IN SOURCE REPO/DB
      const source = GroupSourceBuilder().beta().buildNoCheck();
      this.setSource(source);
      overrides.name = source.name;
      return this;
    },

    invalidSource() {
      const source = GroupSourceBuilder().invalidSource().buildNoCheck();
      this.setSource(source);
      return this;
    },

    invalidStatus() {
      const source = GroupSourceBuilder().invalidStatus().buildNoCheck();
      this.setSource(source);
      return this;
    },

    noSourceExists() {
      overrides.sourceIds = [];
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
      return this;
    },

    exists() {
      const source = GroupSourceBuilder().exists().build();
      this.setSource(source);
      overrides.name = source.name;
      return this;
    },

    updated() {
      const source = GroupSourceBuilder().updated().build();
      this.setSource(source);
      overrides.status = source.status;
      overrides.name = source.name;
      return this;
    },

    fromSource(source: GroupSource) {
      this.setSource(source);
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

    buildCreateByIdSourceValueGroupDto(): CreateGroupDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        findGroupDto: {
          identifier: 'idSourceValue',
          value: prepareExternalIdSourceValue(sourceId.id, sourceId.source),
        },
        findGroupSourceDto: {
          identifier: 'idSource',
          value: sourceId,
        },
      } as CreateGroupDto;
    },

    buildCreateByIdSourceValueGroupRequestDto(): CreateByIdSourceValueGroupRequestDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        idSourceValue: prepareExternalIdSourceValue(
          sourceId.id,
          sourceId.source
        ),
      } as CreateByIdSourceValueGroupRequestDto;
    },

    buildFindByIdGroupDto(): FindGroupDto {
      return {
        identifier: 'id',
        value: this.buildNoCheck().id,
      } as FindGroupDto;
    },

    buildFindByIdGroupRequestDto(): FindByIdGroupRequestDto {
      return {
        id: this.buildNoCheck().id,
      } as FindByIdGroupRequestDto;
    },

    buildFindByIdSourceValueGroupDto(): FindGroupDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        identifier: 'idSourceValue',
        value: prepareExternalIdSourceValue(sourceId.id, sourceId.source),
      } as FindGroupDto;
    },

    buildFindByIdSourceValueGroupRequestDto(): FindByIdSourceValueGroupRequestDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return {
        idSourceValue: prepareExternalIdSourceValue(
          sourceId.id,
          sourceId.source
        ),
      } as FindByIdSourceValueGroupRequestDto;
    },

    buildFindBySlugGroupDto(): FindGroupDto {
      return {
        identifier: 'slug',
        value: this.buildNoCheck().slug,
      } as FindGroupDto;
    },

    buildFindBySlugGroupRequestDto(): FindBySlugGroupRequestDto {
      return {
        slug: this.buildNoCheck().slug,
      } as FindBySlugGroupRequestDto;
    },

    buildUpdateGroupDto(): UpdateGroupDto {
      const sourceId = this.buildNoCheck().sourceIds[0];
      return sourceId as UpdateGroupDto;
    },

    buildUpdateGroupRequestDto(): UpdateGroupRequestDto {
      const sourceIds = this.buildNoCheck().sourceIds;
      if (!sourceIds) {
        return {
          idSourceValue: '',
        } as UpdateGroupRequestDto;
      }
      return {
        idSourceValue: prepareExternalIdSourceValue(
          sourceIds[0].id,
          sourceIds[0].source
        ),
      } as UpdateGroupRequestDto;
    },

    buildGroupResponseDto(): GroupResponseDto {
      const sourceIds = overrides.sourceIds as GroupSourceIdSource[];
      return GroupResponseDto.check({
        ...defaultProperties,
        ...overrides,
        sourceIds: sourceIds.map((idSource) =>
          prepareExternalIdSourceValue(idSource.id, idSource.source)
        ),
      });
    },
  };
};
