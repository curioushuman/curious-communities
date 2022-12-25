import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { MemberSource } from '../../../domain/entities/member-source';
import { MemberSourceRepository } from '../../ports/member-source.repository';
import { MemberSourceBuilder } from '../../../test/builders/member-source.builder';
import { FindMemberSourceDto } from '../../../application/queries/find-member-source/find-member-source.dto';

@Injectable()
export class FakeMemberSourceRepository implements MemberSourceRepository {
  private memberSources: MemberSource[] = [];

  constructor() {
    this.memberSources.push(MemberSourceBuilder().exists().build());
    this.memberSources.push(
      MemberSourceBuilder().invalidSource().buildNoCheck()
    );
    this.memberSources.push(MemberSourceBuilder().alpha().build());
    this.memberSources.push(MemberSourceBuilder().beta().build());
    this.memberSources.push(
      MemberSourceBuilder().invalidStatus().buildNoCheck()
    );
  }

  findOne = (dto: FindMemberSourceDto): TE.TaskEither<Error, MemberSource> => {
    const { id } = dto;
    return TE.tryCatch(
      async () => {
        const memberSource = this.memberSources.find((i) => i.id === id);
        return pipe(
          memberSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Member source with id ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (source) => MemberSource.check(source)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  save = (memberSource: MemberSource): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const memberExists = this.memberSources.find(
          (i) => i.id === memberSource.id
        );
        if (memberExists) {
          this.memberSources = this.memberSources.map((i) =>
            i.id === memberSource.id ? memberSource : i
          );
        } else {
          this.memberSources.push(memberSource);
        }
      },
      (reason: unknown) => reason as Error
    );
  };
}
