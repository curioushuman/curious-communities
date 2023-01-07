import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { Member, MemberIdentifier } from '../../../domain/entities/member';
import {
  MemberCheckMethod,
  MemberFindMethod,
  MemberRepository,
} from '../../ports/member.repository';
import { MemberBuilder } from '../../../test/builders/member.builder';
import { MemberId } from '../../../domain/value-objects/member-id';
import { MemberSourceIdSourceValue } from '../../../domain/value-objects/member-source-id-source';
import { prepareExternalIdSource } from '@curioushuman/common';
import { Source } from '../../../domain/value-objects/source';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';
import { MemberEmail } from '../../../domain/value-objects/member-email';

@Injectable()
export class FakeMemberRepository implements MemberRepository {
  private members: Member[] = [];

  constructor() {
    this.members.push(MemberBuilder().exists().build());
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
        const idSource = prepareExternalIdSource(
          idSourceValue,
          MemberSourceId,
          Source
        );
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

  checkById = (id: MemberId): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const member = this.members.find((cs) => cs.id === id);
        return pipe(
          member,
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
    value: MemberSourceIdSourceValue
  ): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const idSourceValue = MemberSourceIdSourceValue.check(value);
        const idSource = prepareExternalIdSource(
          idSourceValue,
          MemberSourceId,
          Source
        );
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
            () => false,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (_) => true
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  checkByEmail = (email: MemberEmail): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const member = this.members.find((cs) => cs.email === email);
        return pipe(
          member,
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
  checkBy: Record<MemberIdentifier, MemberCheckMethod> = {
    id: this.checkById,
    idSourceValue: this.checkByIdSourceValue,
    email: this.checkByEmail,
  };

  check = (identifier: MemberIdentifier): MemberCheckMethod => {
    return this.checkBy[identifier];
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
