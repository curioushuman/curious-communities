import { LoggableLogger } from '@curioushuman/loggable';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';

import {
  EdAppApiFindOneProcessMethod,
  EdAppApiRepositoryProps,
  EdAppApiSaveOneProcessMethod,
} from './ed-app.repository.types';
import { EdAppApiRepositoryError } from './repository.error-factory.types';
import { URLSearchParams } from 'url';
import { EdAppApiAttributes, EdAppApiResponses } from './types/base-response';

/**
 * E is for entity
 * R is for response type (from EdApp)
 */
export class EdAppApiRepository<
  DomainT,
  SourceT,
  SourceTCreate = EdAppApiAttributes<SourceT>,
  SourceTUpdate = EdAppApiAttributes<SourceT>
> {
  private readonly sourceName: string;
  private readonly sourceRuntype: EdAppApiRepositoryProps['sourceRuntype'];

  public static defaults: Record<string, string[]> = {
    roles: ['app-user', 'prizing-user'],
  };

  constructor(
    props: EdAppApiRepositoryProps,
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
      username: email,
    });
    const endpoint = `${this.sourceName}?${params.toString()}`;

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
    processResult: EdAppApiFindOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareFindOneUri(id);
        const request$ = this.httpService.get<SourceT>(uri);
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return processResult(response.data, uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: EdAppApiRepositoryError) => reason as Error
    );
  };

  tryFindOneByEmail = (
    email: string,
    processResult: EdAppApiFindOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareFindOneByEmailUri(email);
        const request$ = this.httpService.get<EdAppApiResponses<SourceT>>(uri);
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return processResult(response.data.items[0], uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: EdAppApiRepositoryError) => reason as Error
    );
  };

  /**
   * Create a record
   */
  tryCreateOne = (
    entity: SourceTCreate,
    processResult: EdAppApiSaveOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareMutateOneUri();
        const request$ = this.httpService.post<SourceT>(uri, entity);
        const response = await firstValueFrom(request$);
        return processResult(response.data);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: EdAppApiRepositoryError) => reason as Error
    );
  };

  /**
   * Update a record
   */
  tryUpdateOne = (
    id: string,
    entity: SourceTUpdate,
    processResult: EdAppApiSaveOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareMutateOneUri(id);
        const request$ = this.httpService.put<SourceT>(uri, entity);
        const response = await firstValueFrom(request$);
        return processResult(response.data);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: EdAppApiRepositoryError) => reason as Error
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
      (reason: EdAppApiRepositoryError) => reason as Error
    );
  };
}
