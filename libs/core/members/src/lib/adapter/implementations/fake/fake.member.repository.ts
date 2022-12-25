import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { Slug } from '@curioushuman/common';

import { Member } from '../../../domain/entities/member';
import { MemberRepository } from '../../ports/member.repository';
import { MemberBuilder } from '../../../test/builders/member.builder';
import { MemberIdExternal } from '../../../domain/value-objects/member-id-external';

@Injectable()
export class FakeMemberRepository implements MemberRepository {
  private members: Member[] = [];

  constructor() {
    this.members.push(MemberBuilder().exists().build());
  }

  findByExternalId = (
    externalId: MemberIdExternal
  ): TE.TaskEither<Error, Member> => {
    return TE.tryCatch(
      async () => {
        const member = this.members.find((cs) => cs.externalId === externalId);
        return pipe(
          member,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Member with externalId ${externalId} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (member) => Member.check(member)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  findBySlug = (slug: Slug): TE.TaskEither<Error, Member> => {
    return TE.tryCatch(
      async () => {
        const member = this.members.find((cs) => cs.slug === slug);
        return pipe(
          member,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(`Member with slug ${slug} not found`);
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (member) => Member.check(member)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  checkByExternalId = (
    externalId: MemberIdExternal
  ): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const member = this.members.find((i) => i.externalId === externalId);
        return pipe(
          member,
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

  save = (member: Member): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const memberExists = this.members.find(
          (i) => i.externalId === member.externalId
        );
        if (memberExists) {
          this.members = this.members.map((i) =>
            i.externalId === member.externalId ? member : i
          );
        } else {
          this.members.push(member);
        }
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, Member[]> => {
    return TE.right(this.members);
  };
}
