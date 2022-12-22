import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { GroupSource } from '../../../domain/entities/group-source';
import { GroupSourceRepository } from '../../ports/group-source.repository';
import { GroupSourceBuilder } from '../../../test/builders/group-source.builder';
import { FindGroupSourceDto } from '../../../application/queries/find-group-source/find-group-source.dto';

@Injectable()
export class FakeGroupSourceRepository implements GroupSourceRepository {
  private groupSources: GroupSource[] = [];

  constructor() {
    this.groupSources.push(GroupSourceBuilder().exists().build());
    this.groupSources.push(GroupSourceBuilder().invalidSource().buildNoCheck());
    this.groupSources.push(GroupSourceBuilder().alpha().build());
    this.groupSources.push(GroupSourceBuilder().beta().build());
    this.groupSources.push(GroupSourceBuilder().invalidStatus().buildNoCheck());
  }

  findOne = (dto: FindGroupSourceDto): TE.TaskEither<Error, GroupSource> => {
    const { id } = dto;
    return TE.tryCatch(
      async () => {
        const groupSource = this.groupSources.find((cs) => cs.id === id);
        return pipe(
          groupSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Group source with id ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (source) => GroupSource.check(source)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  save = (groupSource: GroupSource): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const groupExists = this.groupSources.find(
          (cs) => cs.id === groupSource.id
        );
        if (groupExists) {
          this.groupSources = this.groupSources.map((cs) =>
            cs.id === groupSource.id ? groupSource : cs
          );
        } else {
          this.groupSources.push(groupSource);
        }
      },
      (reason: unknown) => reason as Error
    );
  };
}
