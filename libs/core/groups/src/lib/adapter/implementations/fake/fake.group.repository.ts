import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { prepareExternalIdSource } from '@curioushuman/common';

import {
  Group,
  GroupBase,
  GroupIdentifier,
} from '../../../domain/entities/group';
import { GroupFindMethod, GroupRepository } from '../../ports/group.repository';
import { GroupBuilder } from '../../../test/builders/group.builder';
import { GroupSourceId } from '../../../domain/value-objects/group-source-id';
import { Source } from '../../../domain/value-objects/source';
import { GroupSourceIdSourceValue } from '../../../domain/value-objects/group-source-id-source';
import { GroupSlug } from '../../../domain/value-objects/group-slug';
import { GroupName } from '../../../domain/value-objects/group-name';
import { CourseId } from '../../../domain/value-objects/course-id';
import { CourseGroup } from '../../../domain/entities/course-group';

@Injectable()
export class FakeGroupRepository implements GroupRepository {
  private groups: Group[] = [];

  private renameGroup<T extends Group | GroupBase>(group: T): T {
    group.name = 'Bland base name' as GroupName;
    return group;
  }

  constructor() {
    this.groups.push(GroupBuilder().exists().buildNoCheck());
    this.groups.push(this.renameGroup(GroupBuilder().updated().buildNoCheck()));
    this.groups.push(
      this.renameGroup(GroupBuilder().existsCourse().buildCourseGroup())
    );
    this.groups.push(
      this.renameGroup(GroupBuilder().updatedCourse().buildCourseGroup())
    );
    this.groups.push(
      this.renameGroup(GroupBuilder().updatedCourseAlpha().buildCourseGroup())
    );
    const invalidSource = GroupBuilder().invalidSource().buildNoCheck();
    invalidSource.name = 'Invalid Source' as GroupName;
    this.groups.push(invalidSource);
    // console.log(this.groups);
    // this.groups.forEach((g) => console.log(g.sourceIds));
  }

  findOneById = (id: GroupSourceId): TE.TaskEither<Error, Group> => {
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
            (group) => group
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  findOneByIdSourceValue = (
    value: GroupSourceIdSourceValue
  ): TE.TaskEither<Error, Group> => {
    return TE.tryCatch(
      async () => {
        const idSourceValue = GroupSourceIdSourceValue.check(value);
        const idSource = prepareExternalIdSource(
          idSourceValue,
          GroupSourceId,
          Source
        );
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
            (group) => group
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  findOneBySlug = (slug: GroupSlug): TE.TaskEither<Error, Group> => {
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
            (group) => group
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  findOneByCourseId = (id: CourseId): TE.TaskEither<Error, CourseGroup> => {
    return TE.tryCatch(
      async () => {
        const group = this.groups.find(
          (cs) => 'courseId' in cs && cs.courseId === id
        );
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
            // if it has a courseId, it's a CourseGroup
            (group) => group as CourseGroup
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
    courseId: this.findOneByCourseId,
  };

  findOne = (identifier: GroupIdentifier): GroupFindMethod => {
    return this.findOneBy[identifier];
  };

  save = (groupBase: GroupBase): TE.TaskEither<Error, GroupBase> => {
    return TE.tryCatch(
      async () => {
        const groupExists = this.groups.find((cs) => cs.id === groupBase.id);
        let group: Group;
        if (groupExists) {
          group = {
            ...groupBase,
            groupMembers: groupExists.groupMembers,
          };
          this.groups = this.groups.map((cs) =>
            cs.id === group.id ? group : cs
          );
        } else {
          group = {
            ...groupBase,
            groupMembers: [],
          };
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
