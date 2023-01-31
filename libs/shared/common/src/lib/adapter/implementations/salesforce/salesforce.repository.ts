import { LoggableLogger } from '@curioushuman/loggable';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';

import {
  SalesforceApiFindOneProcessMethod,
  SalesforceApiQueryField,
  SalesforceApiQueryOperator,
  SalesforceApiRepositoryProps,
} from './salesforce.repository.types';
import { SalesforceApiRepositoryError } from './repository.error-factory.types';
import { SalesforceApiResponses } from './types/base-response';

/**
 * E is for entity
 * R is for response type (from Salesforce)
 */
export class SalesforceApiRepository<DomainT, ResponseT> {
  private readonly sourceName: string;
  private readonly responseRuntype: SalesforceApiRepositoryProps['responseRuntype'];

  constructor(
    props: SalesforceApiRepositoryProps,
    private httpService: HttpService,
    private logger: LoggableLogger
  ) {
    this.sourceName = props.sourceName;
    this.responseRuntype = props.responseRuntype;
  }

  protected fields(): string {
    const rawRunType = this.responseRuntype.omit('attributes');
    const fields = Object.keys(rawRunType.fields).join(',');
    this.logger.verbose(fields);
    return fields;
  }

  protected prepareFindOneUri(id: string): string {
    const endpoint = `sobjects/${this.sourceName}/${id}`;
    this.logger.debug(`Finding ${this.sourceName} with uri ${endpoint}`);
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
    processResult: SalesforceApiFindOneProcessMethod<DomainT, ResponseT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareFindOneUri(id);
        const fields = this.fields();
        const request$ = this.httpService.get<ResponseT>(uri, {
          params: {
            fields,
          },
        });
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
    processResult: SalesforceApiFindOneProcessMethod<DomainT, ResponseT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareQueryUri(values, operator);
        const request$ =
          this.httpService.get<SalesforceApiResponses<ResponseT>>(uri);
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return processResult(response.data.records[0], uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: SalesforceApiRepositoryError) => reason as Error
    );
  };
}
