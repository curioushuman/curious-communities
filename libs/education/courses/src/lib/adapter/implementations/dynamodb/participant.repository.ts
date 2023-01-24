import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import {
  DynamoDBClient,
  DynamoDBServiceException,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  PutCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { LoggableLogger } from '@curioushuman/loggable';
import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import { dashToCamelCase } from '@curioushuman/common';

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
import { DynamoDbItem } from './types/item';

/**
 * A repository for participants
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 */
@Injectable()
export class DynamoDbParticipantRepository
  implements ParticipantRepository, OnModuleDestroy
{
  private client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;

  /**
   * This stuff must mirror what's in the CDK stack and cdk-utils
   */
  private awsResourceTable = 'DynamoDbTable';
  private awsResourceTypeLsi = 'DynamoDbLsi';
  // private gsiAwsResourceType = 'DynamoDbGsi';

  private entityName!: string;
  private tableId!: string;
  private tableName!: string;
  private localIndexes!: Record<string, string>;
  // private globalIndexes: string[];

  private marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false, // false, by default.
  };
  private unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false, // false, by default.
  };

  private prepareName(id: string): string {
    return dashToCamelCase(id);
  }

  private prepareEntity(id: string): void {
    this.entityName = this.prepareName(id);
  }

  private prepareTable(id: string): void {
    this.tableId = id;
    const prefix = process.env.AWS_NAME_PREFIX || '';
    const suffix = this.awsResourceTable;
    this.tableName = `${prefix}${this.prepareName(id)}${suffix}`;
  }

  private prepareLocalIndexes(indexIds: string[]): void {
    let prefix = process.env.AWS_NAME_PREFIX || '';
    prefix += `${this.prepareName(this.tableId)}${this.entityName}`;
    const suffix = this.awsResourceTypeLsi;
    indexIds.forEach(
      (indexId) =>
        (this.localIndexes[indexId] = `${prefix}${this.prepareName(
          indexId
        )}${suffix}`)
    );
  }

  constructor(private logger: LoggableLogger) {
    this.logger.setContext(DynamoDbParticipantRepository.name);

    // set the resource info (in order)
    this.prepareEntity('participant');
    this.prepareTable('participants');
    this.prepareLocalIndexes(['source-id-value']);

    // prepare the DDB clients
    this.client = new DynamoDBClient({ region: process.env.CDK_DEPLOY_REGION });
    // NOTE: this is a wrapper of the above that is designed to be simpler to use
    this.docClient = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: this.marshallOptions,
      unmarshallOptions: this.unmarshallOptions,
    });
  }

  /**
   * A Nest.js lifecycle hook
   *
   * Based on the docs it looks like this hook will be called either
   * when the application is closed (app.close()) or when the application
   * receives a termination signal (SIGINT, SIGTERM, etc.)
   *
   * https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown
   */
  onModuleDestroy() {
    this.client.destroy();
  }

  /**
   * Convenience function to build params for the get command
   */
  prepareParamsGet(primaryKey: string, sortKey?: string): GetCommandInput {
    return {
      TableName: this.tableName,
      Key: {
        primaryKey,
        sortKey,
      },
    };
  }

  /**
   * Converts a scalar value into a DDB query param attribute value
   */
  prepareParamAttributeQuery(value: string | number) {
    return typeof value === 'number' ? { N: value } : { S: value };
  }

  /**
   * Convenience function to build params for the query command when
   * used in a findOne context. i.e. we're querying with the knowledge
   * there will be only one result.
   *
   * NOTE: this function relies on the fact you'll have set up LSI's
   * for each of the identifiers.
   */
  prepareParamsQueryOne(
    lsiId: string,
    sortKeyName: string,
    value: string | number
  ): QueryCommandInput {
    return {
      KeyConditionExpression: `${this.entityName}_${sortKeyName} = :v`,
      ExpressionAttributeValues: {
        ':v': this.prepareParamAttributeQuery(value),
      },
      TableName: this.tableName,
      IndexName: this.localIndexes[lsiId],
    };
  }

  processFindOne(
    item?: Record<string, unknown>,
    params?: GetCommandInput | QueryCommandInput
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

  tryGetOne = (params: GetCommandInput): TE.TaskEither<Error, Participant> => {
    return TE.tryCatch(
      async () => {
        // get the item
        const response = await this.docClient.send(new GetCommand(params));

        // ? logging?

        return this.processFindOne(response.Item, params);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (exception: DynamoDBServiceException) => exception as Error
    );
  };

  tryQueryOne = (
    params: QueryCommandInput
  ): TE.TaskEither<Error, Participant> => {
    return TE.tryCatch(
      async () => {
        // get the item
        const response = await this.docClient.send(new QueryCommand(params));

        // ? logging?

        return this.processFindOne(response.Items?.[0], params);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (exception: DynamoDBServiceException) => exception as Error
    );
  };

  findOneById = (value: ParticipantId): TE.TaskEither<Error, Participant> => {
    // Set the parameters.
    // Participant in DDB has the same PK and SK as the parent of a one-to-many relationship
    const params = this.prepareParamsGet(value, value);
    return this.tryGetOne(params);
  };

  findOneByIdSourceValue = (
    value: ParticipantSourceIdSourceValue
  ): TE.TaskEither<Error, Participant> => {
    // Set the parameters.
    const params = this.prepareParamsQueryOne(
      'source-id-value',
      'SourceIdCOURSE',
      value
    );
    return this.tryQueryOne(params);
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
   * Convenience function to build params for the put command
   */
  preparePutParams(item: DynamoDbItem): PutCommandInput {
    return {
      TableName: this.tableName,
      Item: item,
    };
  }

  /**
   * NOTE: we do not first find the participant. This responsibility
   * is delegated to the service/application layer. If a record is
   * passed to this layer, it is with full knowledge of what is
   * going to happen. i.e. save, and save alone.
   */
  save = (participant: Participant): TE.TaskEither<Error, Participant> => {
    return TE.tryCatch(
      async () => {
        // map to a DDB item
        const item = DynamoDbParticipantMapper.toPersistence(participant);

        // Set the parameters.
        const params = this.preparePutParams(item);

        // put the item
        const response = await this.docClient.send(new PutCommand(params));

        // process the response
        // ? should we get the response.Attributes and map back to a domain object?
        this.logger.debug(response);

        return participant;
      },
      (exception: DynamoDBServiceException) => exception as Error
    );
  };
}
