import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { prepareGroupExternalIdSource } from '../../../domain/entities/group';
import { CourseGroupRepository } from '../../ports/course-group.repository';
import {
  GetGroupIdentifier,
  GroupCheckMethod,
  GroupFindMethod,
} from '../../ports/group.repository.base';
import { GroupBuilder } from '../../../test/builders/group.builder';
import { GroupId } from '../../../domain/value-objects/group-id';
import { GroupSourceIdSourceValue } from '../../../domain/value-objects/group-source-id-source';
import { GroupSlug } from '../../../domain/value-objects/group-slug';
import {
  CourseGroup,
  CourseGroupBase,
} from '../../../domain/entities/course-group';
import { CourseId } from '../../../domain/value-objects/course-id';

@Injectable()
export class FakeCourseGroupRepository implements CourseGroupRepository {
  private groups: CourseGroup[] = [];

  constructor() {
    this.groups.push(GroupBuilder().exists().buildCourseGroup());
  }

  /**
   * Find by internal ID
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneById = (value: GroupId): TE.TaskEither<Error, CourseGroup> => {
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
            (group) => CourseGroup.check(group)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Find by course ID
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneByCourseId = (value: CourseId): TE.TaskEither<Error, CourseGroup> => {
    return TE.tryCatch(
      async () => {
        const id = CourseId.check(value);
        const group = this.groups.find((cs) => cs.courseId === id);
        return pipe(
          group,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Group with courseId ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (group) => CourseGroup.check(group)
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
  ): TE.TaskEither<Error, CourseGroup> => {
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
            (group) => CourseGroup.check(group)
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
  findOneBySlug = (value: GroupSlug): TE.TaskEither<Error, CourseGroup> => {
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
            (group) => CourseGroup.check(group)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  readonly findOneBy: Record<
    GetGroupIdentifier<CourseGroup>,
    GroupFindMethod<CourseGroup>
  > = {
    id: this.findOneById,
    courseId: this.findOneByCourseId,
    idSourceValue: this.findOneByIdSourceValue,
    slug: this.findOneBySlug,
  };

  findOne = (
    identifier: GetGroupIdentifier<CourseGroup>
  ): GroupFindMethod<CourseGroup> => {
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

  checkByCourseId = (value: CourseId): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const id = CourseId.check(value);
        const group = this.groups.find((cs) => cs.courseId === id);
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
  readonly checkBy: Record<
    GetGroupIdentifier<CourseGroup>,
    GroupCheckMethod<CourseGroup>
  > = {
    id: this.checkById,
    courseId: this.checkByCourseId,
    idSourceValue: this.checkByIdSourceValue,
    slug: this.checkBySlug,
  };

  check = (
    identifier: GetGroupIdentifier<CourseGroup>
  ): GroupCheckMethod<CourseGroup> => {
    return this.checkBy[identifier];
  };

  save = (
    group: CourseGroup | CourseGroupBase
  ): TE.TaskEither<Error, CourseGroup> => {
    return TE.tryCatch(
      async () => {
        // sneaky member addition
        // it's a fake repo, so we can do this
        const groupToSave = {
          ...group,
          members: 'members' in group ? group.members : [],
        };
        const groupExists = this.groups.find((g) => g.id === group.id);
        if (groupExists) {
          this.groups = this.groups.map((g) =>
            g.id === group.id ? groupToSave : g
          );
        } else {
          this.groups.push(groupToSave);
        }
        return CourseGroup.check(groupToSave);
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, CourseGroup[]> => {
    return TE.right(this.groups);
  };
}
