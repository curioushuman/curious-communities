import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  GroupSource,
  GroupSourceForCreate,
  GroupSourceIdentifier,
} from '../../../domain/entities/group-source';
import {
  GroupSourceFindMethod,
  GroupSourceRepositoryReadWrite,
} from '../../ports/group-source.repository';
import { GroupSourceBuilder } from '../../../test/builders/group-source.builder';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import config from '../../../static/config';
import { Source } from '../../../domain/value-objects/source';
import { GroupSourceIdSource } from '../../../domain/value-objects/group-source-id-source';
import { GroupName } from '../../../domain/value-objects/group-name';

@Injectable()
export class FakeGroupSourceRepository
  implements GroupSourceRepositoryReadWrite
{
  private groupSources: GroupSource[] = [];

  private renameGroup(group: GroupSource): GroupSource {
    group.name = 'Bland base name' as GroupName;
    return group;
  }

  constructor() {
    this.groupSources.push(GroupSourceBuilder().exists().buildNoCheck());
    this.groupSources.push(
      this.renameGroup(GroupSourceBuilder().updated().buildNoCheck())
    );
    this.groupSources.push(GroupSourceBuilder().updatedAlpha().buildNoCheck());
    this.groupSources.push(GroupSourceBuilder().invalid().buildNoCheck());
    this.groupSources.push(GroupSourceBuilder().alpha().buildNoCheck());
    this.groupSources.push(GroupSourceBuilder().beta().buildNoCheck());
    this.groupSources.push(GroupSourceBuilder().invalidStatus().buildNoCheck());
  }

  /**
   * Find by source ID
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneByIdSource = (
    value: GroupSourceIdSource
  ): TE.TaskEither<Error, GroupSource> => {
    return TE.tryCatch(
      async () => {
        const idSource = GroupSourceIdSource.check(value);
        const groupSource = this.groupSources.find(
          (cs) => cs.id === idSource.id
        );
        return pipe(
          groupSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupSource with id ${idSource.id} not found`
              );
            },
            (gs) => gs
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Find by source ID
   */
  findOneByName = (value: GroupName): TE.TaskEither<Error, GroupSource> => {
    return TE.tryCatch(
      async () => {
        const name = GroupName.check(value);
        const groupSource = this.groupSources.find((cs) => cs.name === name);
        return pipe(
          groupSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupSource with name ${name} not found`
              );
            },
            (gs) => gs
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<GroupSourceIdentifier, GroupSourceFindMethod> = {
    idSource: this.findOneByIdSource,
    name: this.findOneByName,
  };

  findOne = (identifier: GroupSourceIdentifier): GroupSourceFindMethod => {
    return this.findOneBy[identifier];
  };

  create = (
    groupSource: GroupSourceForCreate
  ): TE.TaskEither<Error, GroupSource> => {
    return TE.tryCatch(
      async () => {
        const savedGroupSource = {
          ...groupSource,
          source: config.defaults.primaryAccountSource as Source,
          id: GroupSourceId.check(`FakeId${Date.now()}`),
        };
        this.groupSources.push(savedGroupSource);
        return savedGroupSource;
      },
      (reason: unknown) => reason as Error
    );
  };

  update = (groupSource: GroupSource): TE.TaskEither<Error, GroupSource> => {
    return TE.tryCatch(
      async () => {
        const groupSourceExists = this.groupSources.find(
          (cs) => cs.id === groupSource.id
        );
        if (!groupSourceExists) {
          throw new NotFoundException(
            `GroupSource with id ${groupSource.id} not found`
          );
        }
        this.groupSources = this.groupSources.map((cs) =>
          cs.id === groupSource.id ? groupSource : cs
        );
        return groupSourceExists;
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, GroupSource[]> => {
    return TE.right(this.groupSources);
  };
}
