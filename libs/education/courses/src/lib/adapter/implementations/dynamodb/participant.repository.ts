import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';

import {
  ParticipantFindMethod,
  ParticipantRepository,
} from '../../ports/participant.repository';
import { ParticipantId } from '../../../domain/value-objects/participant-id';
import {
  Participant,
  ParticipantIdentifier,
} from '../../../domain/entities/participant';
import { DynamoDbParticipantMapper } from './participant.mapper';
import { ParticipantSourceIdSourceValue } from '../../../domain/value-objects/participant-source-id-source';
import { DynamoDbParticipant } from './types/participant';
import { DynamoDbRepository } from './dynamodb.repository';
import { DynamoDbFindOneParams } from './dynamodb.repository.types';

/**
 * A repository for participants
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 * - we're using composition rather than inheritance here
 */
@Injectable()
export class DynamoDbParticipantRepository implements ParticipantRepository {
  private dynamoDbRepository: DynamoDbRepository<Participant>;

  constructor(private logger: LoggableLogger) {
    this.logger.setContext(DynamoDbParticipantRepository.name);

    // set up the repository
    this.dynamoDbRepository = new DynamoDbRepository(
      this.logger,
      'participant',
      'participants',
      ['slug', 'source-id-value'],
      'cc'
    );
  }

  processFindOne(
    item?: Record<string, unknown>,
    params?: DynamoDbFindOneParams
  ): Participant {
    // did we find anything?
    if (!item) {
      let errorMsg = 'Participant not found';
      if (params) {
        errorMsg += `: ${JSON.stringify(params)}`;
      }
      throw new RepositoryItemNotFoundError(errorMsg);
    }

    // is it what we expected?
    // will throw error if not
    const participantItem = DynamoDbParticipant.check(item);

    // NOTE: if the response was invalid, an error would have been thrown
    // could this similarly be in a serialisation decorator?
    return DynamoDbParticipantMapper.toDomain(participantItem);
  }

  findOneById = (value: ParticipantId): TE.TaskEither<Error, Participant> => {
    // Set the parameters.
    // Participant in DDB has the same PK and SK as the parent of a one-to-many relationship
    const params = this.dynamoDbRepository.prepareParamsGet(value, value);
    return this.dynamoDbRepository.tryGetOne(params, this.processFindOne);
  };

  findOneByIdSourceValue = (
    value: ParticipantSourceIdSourceValue
  ): TE.TaskEither<Error, Participant> => {
    // Set the parameters.
    const params = this.dynamoDbRepository.prepareParamsQueryOne(
      'source-id-value',
      'SourceIdCOURSE',
      value
    );
    return this.dynamoDbRepository.tryQueryOne(params, this.processFindOne);
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

  processSave(
    participant: Participant
  ): (item?: Record<string, unknown>) => Participant {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (_?: Record<string, unknown>) => {
      // I'm uncertain what particularly to do in here...
      // ? should we process the attributes?
      // const participantItem = DynamoDbParticipant.check(item);
      // return DynamoDbParticipantMapper.toDomain(participantItem);

      // currently, if there were no errors per se
      // we're just returning the participant as it was
      return participant;
    };
  }

  /**
   * NOTE: we do not first find the participant. This responsibility
   * is delegated to the service/application layer. If a record is
   * passed to this layer, it is with full knowledge of what is
   * going to happen. i.e. save, and save alone.
   */
  save = (participant: Participant): TE.TaskEither<Error, Participant> => {
    const item = DynamoDbParticipantMapper.toPersistence(participant);
    const params = this.dynamoDbRepository.preparePutParams(item);
    return this.dynamoDbRepository.trySave(
      params,
      this.processSave(participant)
    );
  };
}
