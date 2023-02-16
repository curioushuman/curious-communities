import { LoggableLogger } from '@curioushuman/loggable';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';
import { URLSearchParams } from 'url';

import {
  TribeApiFindAllProcessMethod,
  TribeApiFindAllProps,
  TribeApiFindOneProcessMethod,
  TribeApiRepositoryProps,
  TribeApiSaveOneProcessMethod,
} from './tribe.repository.types';
import { TribeApiRepositoryError } from './repository.error-factory.types';
import { TribeApiAttributes, TribeApiResponses } from './types/base-response';
import { UnsupportedError } from '@curioushuman/error-factory';

/**
 * Shared resources for Tribe based repositories
 */
export class TribeApiRepository<
  DomainT,
  SourceT,
  SourceTCreate = TribeApiAttributes<SourceT>,
  SourceTUpdate = TribeApiAttributes<SourceT>
> {
  private readonly sourceName: string;
  private readonly parentSourceName: string | undefined;
  private readonly sourceRuntype: TribeApiRepositoryProps['sourceRuntype'];

  public static defaults: Record<string, Record<string, string | boolean>> = {
    user: {
      role: 'member',
      source: 'Facilitated course',
    },
    group: {
      verified: true,
      privacy: 'private',
      registration: 'invitation',
    },
  };

  constructor(
    props: TribeApiRepositoryProps,
    private httpService: HttpService,
    private logger: LoggableLogger
  ) {
    this.sourceName = props.sourceName;
    this.sourceRuntype = props.sourceRuntype;
    this.parentSourceName = props.parentSourceName;
  }

  private hasParent(): boolean {
    return !!this.parentSourceName;
  }

  private checkChildSupport(): void {
    if (this.hasParent()) {
      throw new UnsupportedError(
        'Tribe does not allow this action on a child resource'
      );
    }
  }

  private checkParentSupport(): void {
    if (!this.hasParent()) {
      throw new UnsupportedError(
        'Tribe does not allow this action IF NOT a child resource'
      );
    }
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
    });
    const endpoint = `${this.sourceName}?${params.toString()}`;

    this.logger.debug(
      `Finding ${this.sourceName} by email with uri ${endpoint}`
    );
    return endpoint;
  }

  private prepareQueryUri(query: string): string {
    const params = new URLSearchParams({
      query,
    });
    const endpoint = `${this.sourceName}?${params.toString()}`;
    this.logger.debug(`Querying ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  private prepareFindAllUriWithQuery(
    uri: string,
    props: TribeApiFindAllProps | undefined
  ): string {
    if (!props) {
      return uri;
    }
    const params = new URLSearchParams({
      page: props.page ? props.page.toString() : '1',
      limit: props.limit ? props.limit.toString() : '20', // Tribe default is 20
    });
    return `${uri}?${params.toString()}`;
  }

  private prepareFindAllUri(props?: TribeApiFindAllProps): string {
    const endpoint = this.prepareFindAllUriWithQuery(this.sourceName, props);
    this.logger.debug(`Finding ALL ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  private prepareFindAllChildrenUri(
    parentId: string,
    props?: TribeApiFindAllProps
  ): string {
    const segments = [this.parentSourceName, parentId, this.sourceName];
    const url = segments.join('/');
    const endpoint = this.prepareFindAllUriWithQuery(url, props);
    this.logger.debug(
      `Finding ALL children of ${this.parentSourceName} with uri ${endpoint}`
    );
    return endpoint;
  }

  private prepareMutateOneUri(id?: string): string {
    const suffix = id ? `/${id}` : '';
    const endpoint = `${this.sourceName}${suffix}`;
    this.logger.debug(`Mutating ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  private prepareMutateChildUri(parentId: string, id?: string): string {
    const suffix = id ? `/${id}` : '';
    const segments = [this.parentSourceName, parentId, this.sourceName];
    const endpoint = `${segments.join('/')}${suffix}`;
    this.logger.debug(`Creating ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  /**
   * ? should id be a more specific type?
   */
  tryFindOne = (
    id: string,
    processResult: TribeApiFindOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        this.checkChildSupport();
        const uri = this.prepareFindOneUri(id);
        const request$ = this.httpService.get<SourceT>(uri);
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return processResult(response.data, uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: TribeApiRepositoryError) => reason as Error
    );
  };

  tryFindOneByEmail = (
    email: string,
    processResult: TribeApiFindOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        this.checkChildSupport();
        const uri = this.prepareFindOneByEmailUri(email);
        const request$ = this.httpService.get<TribeApiResponses<SourceT>>(uri);
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return processResult(response.data[0], uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: TribeApiRepositoryError) => reason as Error
    );
  };

  /**
   * A simple function that will return the first record it finds
   * as part of a query request
   */
  tryQueryOne = (
    query: string,
    processResult: TribeApiFindOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        this.checkChildSupport();
        const uri = this.prepareQueryUri(query);
        const request$ = this.httpService.get<SourceT[]>(uri);
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return processResult(response.data[0], uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: TribeApiRepositoryError) => reason as Error
    );
  };

  tryFindAll = (
    processResult: TribeApiFindAllProcessMethod<DomainT, SourceT>,
    props?: TribeApiFindAllProps
  ): TE.TaskEither<Error, DomainT[]> => {
    return TE.tryCatch(
      async () => {
        this.checkChildSupport();
        const uri = this.prepareFindAllUri(props);
        const request$ = this.httpService.get<SourceT[]>(uri);
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return response.data.map(processResult);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: TribeApiRepositoryError) => reason as Error
    );
  };

  /**
   * A simple function that will return the first record it finds
   * as part of a query request
   */
  tryFindAllChildren = (
    parentId: string,
    processResult: TribeApiFindAllProcessMethod<DomainT, SourceT>,
    props?: TribeApiFindAllProps
  ): TE.TaskEither<Error, DomainT[]> => {
    return TE.tryCatch(
      async () => {
        this.checkParentSupport();
        const uri = this.prepareFindAllChildrenUri(parentId, props);
        const request$ = this.httpService.get<SourceT[]>(uri);
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return response.data.map(processResult);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: TribeApiRepositoryError) => reason as Error
    );
  };

  /**
   * Create a record
   */
  tryCreateOne = (
    entity: SourceTCreate,
    processResult: TribeApiSaveOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareMutateOneUri();
        const request$ = this.httpService.post<SourceT>(uri, entity);
        const response = await firstValueFrom(request$);
        return processResult(response.data);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: TribeApiRepositoryError) => reason as Error
    );
  };

  /**
   * Create a child record
   */
  tryCreateChild = (
    parentId: string,
    entity: SourceTCreate
  ): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareMutateChildUri(parentId);
        const request$ = this.httpService.post<SourceT>(uri, entity);
        await firstValueFrom(request$);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: TribeApiRepositoryError) => reason as Error
    );
  };

  /**
   * Update a record
   */
  tryUpdateOne = (
    id: string,
    entity: SourceTUpdate,
    processResult: TribeApiSaveOneProcessMethod<DomainT, SourceT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareMutateOneUri(id);
        const request$ = this.httpService.put<SourceT>(uri, entity);
        const response = await firstValueFrom(request$);
        return processResult(response.data);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: TribeApiRepositoryError) => reason as Error
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
      (reason: TribeApiRepositoryError) => reason as Error
    );
  };

  /**
   * Delete a child record
   *
   * TODO
   * - [ ] check for 204 status in the response
   */
  tryDeleteChild = (
    parentId: string,
    id: string
  ): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareMutateChildUri(parentId, id);
        const request$ = this.httpService.delete(uri);
        await firstValueFrom(request$);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: TribeApiRepositoryError) => reason as Error
    );
  };
}
