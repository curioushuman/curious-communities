import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { GroupMemberSourceRepository } from '../../ports/group-member-source.repository';
import { GroupMemberSourceBuilder } from '../../../test/builders/group-member-source.builder';
import { FindGroupMemberSourceDto } from '../../../application/queries/find-group-member-source/find-group-member-source.dto';

@Injectable()
export class FakeGroupMemberSourceRepository
  implements GroupMemberSourceRepository
{
  private groupMemberSources: GroupMemberSource[] = [];

  constructor() {
    this.groupMemberSources.push(GroupMemberSourceBuilder().exists().build());
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().invalidSource().buildNoCheck()
    );
    this.groupMemberSources.push(GroupMemberSourceBuilder().alpha().build());
    this.groupMemberSources.push(GroupMemberSourceBuilder().beta().build());
    this.groupMemberSources.push(
      GroupMemberSourceBuilder().invalidStatus().buildNoCheck()
    );
  }

  findOne = (
    dto: FindGroupMemberSourceDto
  ): TE.TaskEither<Error, GroupMemberSource> => {
    const { id } = dto;
    return TE.tryCatch(
      async () => {
        const groupMemberSource = this.groupMemberSources.find(
          (cs) => cs.id === id
        );
        return pipe(
          groupMemberSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `GroupMember source with id ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (source) => GroupMemberSource.check(source)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  save = (groupMemberSource: GroupMemberSource): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const groupMemberExists = this.groupMemberSources.find(
          (cs) => cs.id === groupMemberSource.id
        );
        if (groupMemberExists) {
          this.groupMemberSources = this.groupMemberSources.map((cs) =>
            cs.id === groupMemberSource.id ? groupMemberSource : cs
          );
        } else {
          this.groupMemberSources.push(groupMemberSource);
        }
      },
      (reason: unknown) => reason as Error
    );
  };
}
