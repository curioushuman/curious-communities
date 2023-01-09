import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  Group,
  GroupIdentifier,
  prepareGroupExternalIdSource,
} from '../../../domain/entities/group';
import {
  GroupCheckMethod,
  GroupFindMethod,
  GroupRepository,
} from '../../ports/group.repository';
import { GroupBuilder } from '../../../test/builders/group.builder';
import { GroupId } from '../../../domain/value-objects/group-id';
import { GroupSourceIdSourceValue } from '../../../domain/value-objects/group-source-id-source';
import { GroupSlug } from '../../../domain/value-objects/group-slug';

@Injectable()
export class FakeGroupRepository implements GroupRepository {
  private groups: Group[] = [];

  constructor() {
    this.groups.push(GroupBuilder().exists().build());
  }

  /**
   * Find by internal ID
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneById = (value: GroupId): TE.TaskEither<Error, Group> => {
    return TE.tryCatch(
      async () => {
        const id = GroupId.check(value);
        const group = this.groups.find((cs) => cs.id === id);
        return pipe(
          group,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(`Group with id ${id} not found`);
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (group) => Group.check(group)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Find by ID from a particular source
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneByIdSourceValue = (
    value: GroupSourceIdSourceValue
  ): TE.TaskEither<Error, Group> => {
    return TE.tryCatch(
      async () => {
        const idSourceValue = GroupSourceIdSourceValue.check(value);
        const idSource = prepareGroupExternalIdSource(idSourceValue);
        const group = this.groups.find((cs) => {
          const matches = cs.sourceIds.filter(
            (sId) => sId.id === idSource.id && sId.source === idSource.source
          );
          return matches.length > 0;
        });
        return pipe(
          group,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Group with idSource ${idSourceValue} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (group) => Group.check(group)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Find by slug
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneBySlug = (value: GroupSlug): TE.TaskEither<Error, Group> => {
    return TE.tryCatch(
      async () => {
        const slug = GroupSlug.check(value);
        const group = this.groups.find((cs) => cs.slug === slug);
        return pipe(
          group,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(`Group with slug ${slug} not found`);
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (group) => Group.check(group)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<GroupIdentifier, GroupFindMethod> = {
    id: this.findOneById,
    idSourceValue: this.findOneByIdSourceValue,
    slug: this.findOneBySlug,
  };

  findOne = (identifier: GroupIdentifier): GroupFindMethod => {
    return this.findOneBy[identifier];
  };

  checkById = (id: GroupId): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const group = this.groups.find((cs) => cs.id === id);
        return pipe(
          group,
          O.fromNullable,
          O.fold(
            () => false,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_) => true
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  checkByIdSourceValue = (
    value: GroupSourceIdSourceValue
  ): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const idSourceValue = GroupSourceIdSourceValue.check(value);
        const idSource = prepareGroupExternalIdSource(idSourceValue);
        const group = this.groups.find((cs) => {
          const matches = cs.sourceIds.filter(
            (sId) => sId.id === idSource.id && sId.source === idSource.source
          );
          return matches.length > 0;
        });
        return pipe(
          group,
          O.fromNullable,
          O.fold(
            () => false,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_) => true
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  checkBySlug = (slug: GroupSlug): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const group = this.groups.find((cs) => cs.slug === slug);
        return pipe(
          group,
          O.fromNullable,
          O.fold(
            () => false,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_) => true
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for checkBy methods
   */
  checkBy: Record<GroupIdentifier, GroupCheckMethod> = {
    id: this.checkById,
    idSourceValue: this.checkByIdSourceValue,
    slug: this.checkBySlug,
  };

  check = (identifier: GroupIdentifier): GroupCheckMethod => {
    return this.checkBy[identifier];
  };

  save = (group: Group): TE.TaskEither<Error, Group> => {
    return TE.tryCatch(
      async () => {
        const groupExists = this.groups.find((cs) => cs.id === group.id);
        if (groupExists) {
          this.groups = this.groups.map((cs) =>
            cs.id === group.id ? group : cs
          );
        } else {
          this.groups.push(group);
        }
        return group;
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, Group[]> => {
    return TE.right(this.groups);
  };
}
