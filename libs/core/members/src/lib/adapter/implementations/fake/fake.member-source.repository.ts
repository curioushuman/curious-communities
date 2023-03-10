import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  MemberSource,
  MemberSourceForCreate,
  MemberSourceIdentifier,
} from '../../../domain/entities/member-source';
import {
  MemberSourceFindMethod,
  MemberSourceRepositoryReadWrite,
} from '../../ports/member-source.repository';
import { MemberSourceBuilder } from '../../../test/builders/member-source.builder';
import { MemberSourceId } from '../../../domain/value-objects/member-source-id';
import { MemberEmail } from '../../../domain/value-objects/member-email';
import config from '../../../static/config';
import { Source } from '../../../domain/value-objects/source';
import { MemberSourceIdSource } from '../../../domain/value-objects/member-source-id-source';
import { MemberName } from '../../../domain/value-objects/member-name';

@Injectable()
export class FakeMemberSourceRepository
  implements MemberSourceRepositoryReadWrite
{
  private memberSources: MemberSource[] = [];

  private renameMember(member: MemberSource): MemberSource {
    member.name = 'Bland base name' as MemberName;
    return member;
  }

  constructor() {
    this.memberSources.push(MemberSourceBuilder().exists().build());
    this.memberSources.push(
      this.renameMember(MemberSourceBuilder().updated().build())
    );
    this.memberSources.push(
      this.renameMember(MemberSourceBuilder().updatedAlpha().build())
    );
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
  findOneByIdSource = (
    value: MemberSourceIdSource
  ): TE.TaskEither<Error, MemberSource> => {
    return TE.tryCatch(
      async () => {
        const idSource = MemberSourceIdSource.check(value);
        const memberSource = this.memberSources.find(
          (cs) => cs.id === idSource.id
        );
        return pipe(
          memberSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `MemberSource with id ${idSource.id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (memberSource) => MemberSource.check(memberSource)
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
        const memberSource = this.memberSources.find(
          (cs) => cs.email === email
        );
        return pipe(
          memberSource,
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
            (memberSource) => MemberSource.check(memberSource)
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
    idSource: this.findOneByIdSource,
    email: this.findOneByEmail,
  };

  findOne = (identifier: MemberSourceIdentifier): MemberSourceFindMethod => {
    return this.findOneBy[identifier];
  };

  create = (
    memberSource: MemberSourceForCreate
  ): TE.TaskEither<Error, MemberSource> => {
    return TE.tryCatch(
      async () => {
        const savedMemberSource = {
          ...memberSource,
          source: config.defaults.primaryAccountSource as Source,
          id: MemberSourceId.check(`FakeId${Date.now()}`),
        };
        this.memberSources.push(savedMemberSource);
        return savedMemberSource;
      },
      (reason: unknown) => reason as Error
    );
  };

  update = (memberSource: MemberSource): TE.TaskEither<Error, MemberSource> => {
    return TE.tryCatch(
      async () => {
        const memberSourceExists = this.memberSources.find(
          (cs) => cs.id === memberSource.id
        );
        if (!memberSourceExists) {
          throw new NotFoundException(
            `MemberSource with id ${memberSource.id} not found`
          );
        }
        this.memberSources = this.memberSources.map((cs) =>
          cs.id === memberSource.id ? memberSource : cs
        );
        return memberSourceExists;
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, MemberSource[]> => {
    return TE.right(this.memberSources);
  };
}
