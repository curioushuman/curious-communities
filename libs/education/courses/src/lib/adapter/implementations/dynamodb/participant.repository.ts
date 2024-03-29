import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import {
  DynamoDbFindOneParams,
  DynamoDbRepository,
  DynamoDbRepositoryProps,
} from '@curioushuman/common';

import {
  ParticipantFindMethod,
  ParticipantRepository,
} from '../../ports/participant.repository';
import {
  Participant,
  ParticipantFilters,
  ParticipantIdentifier,
  prepareParticipantExternalIdSource,
} from '../../../domain/entities/participant';
import { DynamoDbParticipantMapper } from './participant.mapper';
import { ParticipantSourceIdSourceValue } from '../../../domain/value-objects/participant-source-id-source';
import { DynamoDbParticipant } from './entities/participant';
import { CoursesItem } from './entities/item';
import { CourseId } from '../../../domain/value-objects/course-id';
import { ParticipantId } from '../../../domain/value-objects/participant-id';

/**
 * A repository for participants
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 * - we're using composition rather than inheritance here
 */
@Injectable()
export class DynamoDbParticipantRepository implements ParticipantRepository {
  private dynamoDbRepository: DynamoDbRepository<Participant, CoursesItem>;

  constructor(private logger: LoggableLogger) {
    this.logger.setContext(DynamoDbParticipantRepository.name);

    // set up the repository
    const props: DynamoDbRepositoryProps = {
      entityId: 'participant',
      tableId: 'courses',
      globalIndexes: [
        'id',
        'source-id-COURSE',
        {
          id: 'member-id',
          partitionKey: 'Member_Id',
          sortKey: 'Sk_Member_Id',
        },
      ],
      localIndexes: [
        {
          id: 'member-last-name',
          sortKey: 'Member_LastName',
        },
      ],
      prefix: 'cc',
    };
    this.dynamoDbRepository = new DynamoDbRepository(props, this.logger);
  }

  processFindOne(
    item?: Record<string, unknown>,
    params?: DynamoDbFindOneParams
  ): Participant {
    // did we find anything?
    if (!item) {
      throw new RepositoryItemNotFoundError(
        DynamoDbRepository.prepareErrorMessage('Participant not found', params)
      );
    }
    // is it what we expected?
    // will throw error if not
    const participantItem = DynamoDbParticipant.check(item);

    const domainItem = DynamoDbParticipantMapper.toDomain(participantItem);

    // NOTE: if the response was invalid, an error would have been thrown
    // could this similarly be in a serialisation decorator?
    return domainItem;
  }

  findOneById = (value: ParticipantId): TE.TaskEither<Error, Participant> => {
    const params = this.dynamoDbRepository.prepareParamsQueryOne({
      indexId: 'id',
      value,
    });
    return this.dynamoDbRepository.tryQueryOne(params, this.processFindOne);
  };

  findOneByIdSourceValue = (
    value: ParticipantSourceIdSourceValue
  ): TE.TaskEither<Error, Participant> => {
    // Set the parameters.
    const { source } = prepareParticipantExternalIdSource(value);
    const params = this.dynamoDbRepository.prepareParamsQueryOne({
      indexId: `source-id-${source}`,
      value,
    });
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

  /**
   * It is at this stage we know
   * - what the dto/input looks like
   * - what DDB indexes we have
   * So it is here, that we reshape the input to match the indexes
   */
  findAll = (props: {
    parentId?: CourseId;
    filters?: ParticipantFilters;
  }): TE.TaskEither<Error, Participant[]> => {
    const { parentId, filters } = props;
    const { memberId } = filters || {};
    const indexId = memberId ? 'member-id' : undefined;
    const partitionKeyValue = memberId || parentId;
    const params = this.dynamoDbRepository.prepareParamsFindAll({
      partitionKeyValue,
      indexId,
    });
    return this.dynamoDbRepository.tryFindAll(params, this.processFindOne);
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
