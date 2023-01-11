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
  GroupSourceRepository,
} from '../../ports/group-source.repository';
import { GroupSourceBuilder } from '../../../test/builders/group-source.builder';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { Group } from '../../../domain/entities/group';
import { Source } from '../../../domain/value-objects/source';

@Injectable()
export class FakeGroupSourceRepository implements GroupSourceRepository {
  private groupSources: GroupSource[] = [];

  readonly source: Source = 'GROUP';

  constructor() {
    this.groupSources.push(GroupSourceBuilder().exists().build());
    this.groupSources.push(GroupSourceBuilder().invalidSource().buildNoCheck());
    this.groupSources.push(GroupSourceBuilder().alpha().build());
    this.groupSources.push(GroupSourceBuilder().beta().build());
    this.groupSources.push(GroupSourceBuilder().invalidStatus().buildNoCheck());
  }

  /**
   * Find by source ID
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneById = (value: GroupSourceId): TE.TaskEither<Error, GroupSource> => {
    return TE.tryCatch(
      async () => {
        const id = GroupSourceId.check(value);
        const groupSource = this.groupSources.find((cs) => cs.id === id);
        return pipe(
          groupSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupSource with id ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (groupSource) => GroupSource.check(groupSource)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Find by any value on the entity
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneByEntity = (group: Group): TE.TaskEither<Error, GroupSource> => {
    return TE.tryCatch(
      async () => {
        const groupSource = this.groupSources.find(
          (g) => g.name === group.name
        );
        return pipe(
          groupSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupSource matching ${group.name} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (groupSource) => GroupSource.check(groupSource)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  readonly findOneBy: Record<GroupSourceIdentifier, GroupSourceFindMethod> = {
    // NOTE: idSource is parsed to id in application layer
    idSource: this.findOneById,
    entity: this.findOneByEntity,
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
          (gS) => gS.id === groupSource.id
        );
        if (!groupSourceExists) {
          throw new NotFoundException(
            `GroupSource with id ${groupSource.id} not found`
          );
        }
        this.groupSources = this.groupSources.map((cs) =>
          cs.id === groupSource.id ? groupSource : cs
        );
        return groupSource;
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, GroupSource[]> => {
    return TE.right(this.groupSources);
  };
}
