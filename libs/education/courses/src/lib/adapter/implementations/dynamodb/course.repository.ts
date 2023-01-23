import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
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
  CourseFindMethod,
  CourseRepository,
} from '../../ports/course.repository';
import { CourseId } from '../../../domain/value-objects/course-id';
import { CourseBase, CourseIdentifier } from '../../../domain/entities/course';
import { DynamoDbCourseMapper } from './course.mapper';
import { CourseSlug } from '../../../domain/value-objects/course-slug';
import { CourseSourceIdSourceValue } from '../../../domain/value-objects/course-source-id-source';
import { DynamoDbCourse } from './types/course';
import { DynamoDbItem } from './types/item';

/**
 * A repository for courses
 *
 * NOTES:
 * - repos for parent entities, by default, do not return children
 */
@Injectable()
export class DynamoDbCourseRepository
  implements CourseRepository, OnModuleDestroy
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
    this.logger.setContext(DynamoDbCourseRepository.name);

    // set the resource info (in order)
    this.prepareEntity('course');
    this.prepareTable('courses');
    this.prepareLocalIndexes(['slug', 'source-id-value']);

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
  ): CourseBase {
    // did we find anything?
    if (!item) {
      let errorMsg = 'Course not found';
      if (params) {
        errorMsg += `: ${JSON.stringify(params)}`;
      }
      throw new RepositoryItemNotFoundError(errorMsg);
    }

    // is it what we expected?
    // will throw error if not
    const courseItem = DynamoDbCourse.check(item);

    // NOTE: if the response was invalid, an error would have been thrown
    // could this similarly be in a serialisation decorator?
    return DynamoDbCourseMapper.toDomain(courseItem);
  }

  tryGetOne = (params: GetCommandInput): TE.TaskEither<Error, CourseBase> => {
    return TE.tryCatch(
      async () => {
        // get the item
        const response = await this.docClient.send(new GetCommand(params));

        // ? logging?

        return this.processFindOne(response.Item, params);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  tryQueryOne = (
    params: QueryCommandInput
  ): TE.TaskEither<Error, CourseBase> => {
    return TE.tryCatch(
      async () => {
        // get the item
        const response = await this.docClient.send(new QueryCommand(params));

        // ? logging?

        return this.processFindOne(response.Items?.[0], params);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: unknown) => reason as Error
    );
  };

  findOneById = (value: CourseId): TE.TaskEither<Error, CourseBase> => {
    // Set the parameters.
    // Course in DDB has the same PK and SK as the parent of a one-to-many relationship
    const params = this.prepareParamsGet(value, value);
    return this.tryGetOne(params);
  };

  findOneBySlug = (value: CourseSlug): TE.TaskEither<Error, CourseBase> => {
    // Set the parameters.
    const params = this.prepareParamsQueryOne('slug', 'Slug', value);
    return this.tryQueryOne(params);
  };

  findOneByIdSourceValue = (
    value: CourseSourceIdSourceValue
  ): TE.TaskEither<Error, CourseBase> => {
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
  findOneBy: Record<CourseIdentifier, CourseFindMethod> = {
    id: this.findOneById,
    idSourceValue: this.findOneByIdSourceValue,
    slug: this.findOneBySlug,
  };

  findOne = (identifier: CourseIdentifier): CourseFindMethod => {
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
   * NOTE: we do not first find the course. This responsibility
   * is delegated to the service/application layer. If a record is
   * passed to this layer, it is with full knowledge of what is
   * going to happen. i.e. save, and save alone.
   */
  save = (course: CourseBase): TE.TaskEither<Error, CourseBase> => {
    return TE.tryCatch(
      async () => {
        // map to a DDB item
        const item = DynamoDbCourseMapper.toPersistence(course);

        // Set the parameters.
        const params = this.preparePutParams(item);

        // put the item
        const response = await this.docClient.send(new PutCommand(params));

        // process the response
        // ? should we get the response.Attributes and map back to a domain object?
        this.logger.debug(response);

        return course;
      },
      (reason: unknown) => reason as Error
    );
  };
}
