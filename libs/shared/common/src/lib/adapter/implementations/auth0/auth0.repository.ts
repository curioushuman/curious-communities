import { LoggableLogger } from '@curioushuman/loggable';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';
import { URLSearchParams } from 'url';

import {
  Auth0ApiFindOneProcessMethod,
  Auth0ApiRepositoryProps,
  Auth0ApiSaveOneProcessMethod,
} from './auth0.repository.types';
import { Auth0ApiRepositoryError } from './repository.error-factory.types';
import { Auth0ApiAttributes, Auth0ApiResponses } from './types/base-response';

/**
 * E is for entity
 * R is for response type (from Auth0)
 */
export class Auth0ApiRepository<
  DomainT,
  SourceT,
  SourceTCreate = Auth0ApiAttributes<SourceT>
> {
  private readonly sourceName: string;
  private readonly sourceRuntype: Auth0ApiRepositoryProps['sourceRuntype'];

  public static defaults: Record<string, string> = {
    connection: 'Username-Password-Authentication',
  };

  constructor(
    props: Auth0ApiRepositoryProps,
    private httpService: HttpService,
    private logger: LoggableLogger
  ) {
    this.sourceName = props.sourceName;
    this.sourceRuntype = props.sourceRuntype;
  }

  private fields(): string {
    const fields = Object.keys(this.sourceRuntype.fields).join(',');
    this.logger.verbose(fields);
    return fields;
  }

  private prepareFindOneUri(id: string): string {
    const endpoint = `${this.sourceName}/${id}`;
    this.logger.debug(`Finding ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  private prepareFindOneByEmailUri(email: string): string {
    const params = new URLSearchParams({
      email,
      fields: this.fields(),
    });
    const endpoint = `${this.sourceName}-by-email?${params.toString()}`;

    this.logger.debug(`Finding ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  private prepareMutateOneUri(id?: string): string {
    const suffix = id ? `/${id}` : '';
    const endpoint = `${this.sourceName}${suffix}`;
    this.logger.debug(`Finding ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  /**
   * ? should id be a more specific type?
   */
  tryFindOne = (
    id: string,
    processResult: Auth0ApiFindOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareFindOneUri(id);
        const fields = this.fields();
        const request$ = this.httpService.get<SourceT>(uri, {
          params: {
            fields,
          },
        });
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return processResult(response.data, uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: Auth0ApiRepositoryError) => reason as Error
    );
  };

  tryFindOneByEmail = (
    email: string,
    processResult: Auth0ApiFindOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareFindOneByEmailUri(email);
        const request$ = this.httpService.get<Auth0ApiResponses<SourceT>>(uri);
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return processResult(response.data[0], uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: Auth0ApiRepositoryError) => reason as Error
    );
  };

  /**
   * Create a record
   */
  tryCreateOne = (
    entity: SourceTCreate,
    processResult: Auth0ApiSaveOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareMutateOneUri();
        const request$ = this.httpService.post<SourceT>(uri, entity);
        const response = await firstValueFrom(request$);
        return processResult(response.data);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: Auth0ApiRepositoryError) => reason as Error
    );
  };

  /**
   * Update a record
   */
  tryUpdateOne = (
    id: string,
    entity: Auth0ApiAttributes<SourceT>,
    processResult: Auth0ApiSaveOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareMutateOneUri(id);
        const request$ = this.httpService.patch<SourceT>(uri, entity);
        const response = await firstValueFrom(request$);
        return processResult(response.data);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: Auth0ApiRepositoryError) => reason as Error
    );
  };

  /**
   * Delete a record
   *
   * TODO
   * - [ ] check for 204 status in the response
   */
  tryDeleteOne = (id: string): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareMutateOneUri(id);
        const request$ = this.httpService.delete(uri);
        await firstValueFrom(request$);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: Auth0ApiRepositoryError) => reason as Error
    );
  };
}
