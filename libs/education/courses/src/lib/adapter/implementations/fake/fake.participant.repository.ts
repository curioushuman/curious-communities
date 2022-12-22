import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { Participant } from '../../../domain/entities/participant';
import { ParticipantRepository } from '../../ports/participant.repository';
import { ParticipantBuilder } from '../../../test/builders/participant.builder';
import { ParticipantId } from '../../../domain/value-objects/participant-id';

@Injectable()
export class FakeParticipantRepository implements ParticipantRepository {
  private participants: Participant[] = [];

  constructor() {
    this.participants.push(ParticipantBuilder().exists().build());
  }

  findById = (id: ParticipantId): TE.TaskEither<Error, Participant> => {
    return TE.tryCatch(
      async () => {
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

  checkById = (id: ParticipantId): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const participant = this.participants.find((cs) => cs.id === id);
        return pipe(
          participant,
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
