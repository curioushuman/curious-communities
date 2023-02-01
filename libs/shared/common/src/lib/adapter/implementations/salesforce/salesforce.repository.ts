import { LoggableLogger } from '@curioushuman/loggable';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';

import {
  SalesforceApiFindOneProcessMethod,
  SalesforceApiQueryField,
  SalesforceApiQueryOperator,
  SalesforceApiRepositoryProps,
  SalesforceApiSaveOneProcessMethod,
} from './salesforce.repository.types';
import { SalesforceApiRepositoryError } from './repository.error-factory.types';
import {
  SalesforceApiAttributes,
  SalesforceApiResponse,
  SalesforceApiResponseFromCreate,
  SalesforceApiResponses,
} from './types/base-response';
import { SalesforceApiRepositoryErrorFactory } from './repository.error-factory';
import { RunTypeReplica } from '../common/repository.types';

/**
 * E is for entity
 * R is for response type (from Salesforce)
 */
export class SalesforceApiRepository<DomainT, SourceT> {
  private readonly sourceName: string;
  private readonly sourceRuntype: RunTypeReplica;

  constructor(
    props: SalesforceApiRepositoryProps,
    private httpService: HttpService,
    private logger: LoggableLogger
  ) {
    this.sourceName = props.sourceName;
    this.sourceRuntype = props.sourceRuntype;
  }

  protected fields(): string {
    const fields = Object.keys(this.sourceRuntype.fields).join(',');
    this.logger.verbose(fields);
    return fields;
  }

  protected prepareFindOneUri(id: string): string {
    const endpoint = `sobjects/${this.sourceName}/${id}`;
    this.logger.debug(`Finding ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  protected prepareSaveOneUri(id?: string): string {
    const suffix = id ? `/${id}` : '';
    const endpoint = `sobjects/${this.sourceName}${suffix}`;
    this.logger.debug(`Saving ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  /**
   * Only supports AND | OR
   */
  protected prepareQueryUri(
    values: SalesforceApiQueryField[],
    operator: SalesforceApiQueryOperator = 'AND'
  ): string {
    const whereClause = values
      .map((value) => `${value.field}='${value.value}'`)
      .join(` ${operator} `);
    const endpoint = `query/?q=SELECT+${this.fields()}+FROM+${
      this.sourceName
    }+WHERE+${whereClause}`;
    this.logger.debug(`Querying ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  /**
   * ? should id be a more specific type?
   */
  tryFindOne = (
    id: string,
    processResult: SalesforceApiFindOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareFindOneUri(id);
        const fields = this.fields();
        const request$ = this.httpService.get<SalesforceApiResponse<SourceT>>(
          uri,
          {
            params: {
              fields,
            },
          }
        );
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return processResult(response.data, uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: SalesforceApiRepositoryError) => reason as Error
    );
  };

  /**
   * Query by a series of WHERE values
   */
  tryQueryOne = (
    values: SalesforceApiQueryField[],
    operator: SalesforceApiQueryOperator,
    processResult: SalesforceApiFindOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareQueryUri(values, operator);
        const request$ =
          this.httpService.get<SalesforceApiResponses<SourceT>>(uri);
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return processResult(response.data.records[0], uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: SalesforceApiRepositoryError) => reason as Error
    );
  };

  /**
   * Create a record
   */
  tryCreateOne = (
    entity: SalesforceApiAttributes<SourceT>,
    processResult: SalesforceApiSaveOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareSaveOneUri();
        const request$ = this.httpService.post<SalesforceApiResponseFromCreate>(
          uri,
          entity
        );
        const response = await firstValueFrom(request$);

        // Errors might be thrown, but they are also included in the response
        if (!response.data.success) {
          throw SalesforceApiRepositoryErrorFactory.prepareError(
            response.data.errors[0]
          );
        }

        // TODO: shouldn't be typecasting here
        const result: unknown = {
          Id: response.data.id,
          ...entity,
        };

        return processResult(result as SourceT);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: SalesforceApiRepositoryError) => reason as Error
    );
  };

  /**
   * Update a record
   */
  tryUpdateOne = (
    id: string,
    entity: SalesforceApiAttributes<SourceT>,
    processResult: SalesforceApiSaveOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareSaveOneUri(id);
        // NOTE: update returns no data, so we don't need to process it
        this.httpService.patch(uri, entity);

        // TODO: shouldn't be typecasting here
        const result: unknown = {
          Id: id,
          ...entity,
        };

        return processResult(result as SourceT);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: SalesforceApiRepositoryError) => reason as Error
    );
  };
}
