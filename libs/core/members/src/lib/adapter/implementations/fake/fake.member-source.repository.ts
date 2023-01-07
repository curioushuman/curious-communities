import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  MemberSource,
  MemberSourceIdentifier,
} from '../../../domain/entities/member-source';
import {
  MemberSourceFindMethod,
  MemberSourceRepository,
} from '../../ports/member-source.repository';
import { MemberSourceBuilder } from '../../../test/builders/member-source.builder';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';
import { MemberEmail } from '../../../domain/value-objects/member-email';

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

  /**
   * Find by source ID
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneById = (value: MemberSourceId): TE.TaskEither<Error, MemberSource> => {
    return TE.tryCatch(
      async () => {
        const id = MemberSourceId.check(value);
        const member = this.memberSources.find((cs) => cs.id === id);
        return pipe(
          member,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `MemberSource with id ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (member) => MemberSource.check(member)
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
  findOneByEmail = (value: MemberEmail): TE.TaskEither<Error, MemberSource> => {
    return TE.tryCatch(
      async () => {
        const email = MemberEmail.check(value);
        const member = this.memberSources.find((cs) => cs.email === email);
        return pipe(
          member,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `MemberSource with email ${email} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (member) => MemberSource.check(member)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<MemberSourceIdentifier, MemberSourceFindMethod> = {
    // NOTE: idSource is parsed to id in application layer
    idSource: this.findOneById,
    email: this.findOneByEmail,
  };

  findOne = (identifier: MemberSourceIdentifier): MemberSourceFindMethod => {
    return this.findOneBy[identifier];
  };

  save = (memberSource: MemberSource): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const memberExists = this.memberSources.find(
          (cs) => cs.id === memberSource.id
        );
        if (memberExists) {
          this.memberSources = this.memberSources.map((cs) =>
            cs.id === memberSource.id ? memberSource : cs
          );
        } else {
          this.memberSources.push(memberSource);
        }
      },
      (reason: unknown) => reason as Error
    );
  };
}
