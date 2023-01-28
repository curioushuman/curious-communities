import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  Member,
  MemberIdentifier,
  prepareMemberExternalIdSource,
} from '../../../domain/entities/member';
import {
  MemberFindMethod,
  MemberRepository,
} from '../../ports/member.repository';
import { MemberBuilder } from '../../../test/builders/member.builder';
import { MemberId } from '../../../domain/value-objects/member-id';
import { MemberSourceIdSourceValue } from '../../../domain/value-objects/member-source-id-source';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import { MemberName } from '../../../domain/value-objects/member-name';

@Injectable()
export class FakeMemberRepository implements MemberRepository {
  private members: Member[] = [];

  constructor() {
    this.members.push(MemberBuilder().exists().build());
    const invalidSource = MemberBuilder().invalidSource().buildNoCheck();
    invalidSource.name = 'Invalid Source' as MemberName;
    this.members.push(invalidSource);
  }

  /**
   * Find by internal ID
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneById = (value: MemberId): TE.TaskEither<Error, Member> => {
    return TE.tryCatch(
      async () => {
        const id = MemberId.check(value);
        const member = this.members.find((cs) => cs.id === id);
        return pipe(
          member,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(`Member with id ${id} not found`);
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

  /**
   * Find by ID from a particular source
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneByIdSourceValue = (
    value: MemberSourceIdSourceValue
  ): TE.TaskEither<Error, Member> => {
    return TE.tryCatch(
      async () => {
        const idSourceValue = MemberSourceIdSourceValue.check(value);
        const idSource = prepareMemberExternalIdSource(idSourceValue);
        const member = this.members.find((cs) => {
          const matches = cs.sourceIds.filter(
            (sId) => sId.id === idSource.id && sId.source === idSource.source
          );
          return matches.length > 0;
        });
        return pipe(
          member,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Member with idSource ${idSourceValue} not found`
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

  /**
   * Find by email
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneByEmail = (value: MemberEmail): TE.TaskEither<Error, Member> => {
    return TE.tryCatch(
      async () => {
        const email = MemberEmail.check(value);
        const member = this.members.find((cs) => cs.email === email);
        return pipe(
          member,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Member with email ${email} not found`
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

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<MemberIdentifier, MemberFindMethod> = {
    id: this.findOneById,
    idSourceValue: this.findOneByIdSourceValue,
    email: this.findOneByEmail,
  };

  findOne = (identifier: MemberIdentifier): MemberFindMethod => {
    return this.findOneBy[identifier];
  };

  save = (member: Member): TE.TaskEither<Error, Member> => {
    return TE.tryCatch(
      async () => {
        const memberExists = this.members.find((cs) => cs.id === member.id);
        if (memberExists) {
          this.members = this.members.map((cs) =>
            cs.id === member.id ? member : cs
          );
        } else {
          this.members.push(member);
        }
        return member;
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, Member[]> => {
    return TE.right(this.members);
  };
}
