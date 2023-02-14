import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  ParticipantSource,
  ParticipantSourceIdentifier,
} from '../../../domain/entities/participant-source';
import {
  ParticipantSourceFindMethod,
  ParticipantSourceRepository,
} from '../../ports/participant-source.repository';
import { ParticipantSourceBuilder } from '../../../test/builders/participant-source.builder';
import { ParticipantSourceId } from '../../../domain/value-objects/participant-source-id';
import { ParticipantSourceIdSource } from '../../../domain/value-objects/participant-source-id-source';

@Injectable()
export class FakeParticipantSourceRepository
  implements ParticipantSourceRepository
{
  private participantSources: ParticipantSource[] = [];

  constructor() {
    this.participantSources.push(ParticipantSourceBuilder().exists().build());
    this.participantSources.push(
      ParticipantSourceBuilder().invalidSource().buildNoCheck()
    );
    this.participantSources.push(ParticipantSourceBuilder().alpha().build());
    this.participantSources.push(ParticipantSourceBuilder().beta().build());
    this.participantSources.push(
      ParticipantSourceBuilder().invalidStatus().buildNoCheck()
    );
  }

  findOneByIdSource = (
    value: ParticipantSourceIdSource
  ): TE.TaskEither<Error, ParticipantSource> => {
    return TE.tryCatch(
      async () => {
        const id = ParticipantSourceId.check(value.id);
        const participantSource = this.participantSources.find(
          (cs) => cs.id === id
        );
        return pipe(
          participantSource,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Participant source with id ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (source) => ParticipantSource.check(source)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<ParticipantSourceIdentifier, ParticipantSourceFindMethod> =
    {
      idSource: this.findOneByIdSource,
    };

  findOne = (
    identifier: ParticipantSourceIdentifier
  ): ParticipantSourceFindMethod => {
    return this.findOneBy[identifier];
  };

  save = (participantSource: ParticipantSource): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const participantExists = this.participantSources.find(
          (cs) => cs.id === participantSource.id
        );
        if (participantExists) {
          this.participantSources = this.participantSources.map((cs) =>
            cs.id === participantSource.id ? participantSource : cs
          );
        } else {
          this.participantSources.push(participantSource);
        }
      },
      (reason: unknown) => reason as Error
    );
  };
}
