import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  Participant,
  ParticipantIdentifier,
} from '../../../domain/entities/participant';
import {
  ParticipantFindMethod,
  ParticipantRepository,
} from '../../ports/participant.repository';
import { ParticipantBuilder } from '../../../test/builders/participant.builder';
import { ParticipantId } from '../../../domain/value-objects/participant-id';
import { ParticipantSourceIdSourceValue } from '../../../domain/value-objects/participant-source-id-source';
import { prepareExternalIdSource } from '@curioushuman/common';
import { Source } from '../../../domain/value-objects/source';

@Injectable()
export class FakeParticipantRepository implements ParticipantRepository {
  private participants: Participant[] = [];

  constructor() {
    this.participants.push(ParticipantBuilder().exists().build());
  }

  /**
   * Find by internal ID
   *
   * ? Should the value check be extracted into it's own (functional) step?
   */
  findOneById = (value: ParticipantId): TE.TaskEither<Error, Participant> => {
    return TE.tryCatch(
      async () => {
        const id = ParticipantId.check(value);
        const participant = this.participants.find((cs) => cs.id === id);
        return pipe(
          participant,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Participant with id ${id} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (participant) => Participant.check(participant)
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
    value: ParticipantSourceIdSourceValue
  ): TE.TaskEither<Error, Participant> => {
    return TE.tryCatch(
      async () => {
        const idSourceValue = ParticipantSourceIdSourceValue.check(value);
        const idSource = prepareExternalIdSource(
          idSourceValue,
          ParticipantId,
          Source
        );
        const participant = this.participants.find((cs) =>
          cs.sourceIds.includes(idSource)
        );
        return pipe(
          participant,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Participant with idSource ${idSourceValue} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (participant) => Participant.check(participant)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<ParticipantIdentifier, ParticipantFindMethod> = {
    id: this.findOneById,
    idSourceValue: this.findOneByIdSourceValue,
  };

  findOne = (identifier: ParticipantIdentifier): ParticipantFindMethod => {
    return this.findOneBy[identifier];
  };

  checkById = (id: ParticipantId): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const participant = this.participants.find((cs) => cs.id === id);
        return pipe(
          participant,
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

  save = (participant: Participant): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const participantExists = this.participants.find(
          (cs) => cs.id === participant.id
        );
        if (participantExists) {
          this.participants = this.participants.map((cs) =>
            cs.id === participant.id ? participant : cs
          );
        } else {
          this.participants.push(participant);
        }
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, Participant[]> => {
    return TE.right(this.participants);
  };
}
