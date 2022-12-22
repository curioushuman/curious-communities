import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { Slug } from '@curioushuman/common';

import { Group } from '../../../domain/entities/group';
import { GroupRepository } from '../../ports/group.repository';
import { GroupBuilder } from '../../../test/builders/group.builder';
import { GroupId } from '../../../domain/value-objects/group-id';

@Injectable()
export class FakeGroupRepository implements GroupRepository {
  private groups: Group[] = [];

  constructor() {
    this.groups.push(GroupBuilder().exists().build());
  }

  findById = (id: GroupId): TE.TaskEither<Error, Group> => {
    return TE.tryCatch(
      async () => {
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

  findBySlug = (slug: Slug): TE.TaskEither<Error, Group> => {
    return TE.tryCatch(
      async () => {
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

  checkById = (id: GroupId): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const group = this.groups.find((cs) => cs.id === id);
        return pipe(
          group,
          O.fromNullable,
          O.fold(
            () => false,
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_) => true
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  save = (group: Group): TE.TaskEither<Error, void> => {
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
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, Group[]> => {
    return TE.right(this.groups);
  };
}
