import { LoggableLogger } from '@curioushuman/loggable';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';
import { URLSearchParams } from 'url';

import { UnsupportedError } from '@curioushuman/error-factory';

import {
  EdAppApiAttributes,
  EdAppApiFindAllProcessMethod,
  EdAppApiFindAllProps,
  EdAppApiFindAllPropsConfirmed,
  EdAppApiFindAllResponse,
  EdAppApiFindOneProcessMethod,
  EdAppApiRepositoryError,
  EdAppApiRepositoryProps,
  EdAppApiResponses,
  EdAppApiSaveOneProcessMethod,
} from './__types__';
import { RestApiFindAllProps, RestApiFindAllResponse } from '../__types__';

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
  private readonly parentSourceName: string | undefined;
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
    this.parentSourceName = props.parentSourceName;
  }

  private hasParent(): boolean {
    return !!this.parentSourceName;
  }

  private checkChildSupport(): void {
    if (this.hasParent()) {
      throw new UnsupportedError(
        'EdApp does not allow this action on a child resource'
      );
    }
  }

  private checkParentSupport(): void {
    if (!this.hasParent()) {
      throw new UnsupportedError(
        'EdApp does not allow this action IF NOT a child resource'
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
      username: email,
    });
    const endpoint = `${this.sourceName}?${params.toString()}`;

    this.logger.debug(`Finding ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  private prepareFindAllUriWithQuery(
    uri: string,
    props: EdAppApiFindAllPropsConfirmed
  ): string {
    const params = new URLSearchParams({
      page: props.page.toString(),
      limit: props.pagesize.toString(),
    });
    return `${uri}?${params.toString()}`;
  }

  public prepareFindAllProps(
    props?: RestApiFindAllProps
  ): EdAppApiFindAllPropsConfirmed {
    return this.confirmFindAllProps({
      page: props?.page,
      pagesize: props?.limit,
    });
  }

  private confirmFindAllProps(
    props?: EdAppApiFindAllProps
  ): EdAppApiFindAllPropsConfirmed {
    return {
      page: props?.page ? props.page : 1,
      // EdApp default is 25
      pagesize: props?.pagesize ? props.pagesize : 25,
    };
  }

  private prepareFindAllUri(props: EdAppApiFindAllPropsConfirmed): string {
    const endpoint = this.prepareFindAllUriWithQuery(this.sourceName, props);
    this.logger.debug(`Finding ALL ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  private prepareFindAllChildrenUri(
    parentId: string,
    props: EdAppApiFindAllPropsConfirmed
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
    this.logger.debug(`Finding ${this.sourceName} with uri ${endpoint}`);
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

  private prepareFindAllResponse(
    response: EdAppApiFindAllResponse<SourceT>,
    processResult: EdAppApiFindAllProcessMethod<DomainT, SourceT>,
    props: EdAppApiFindAllPropsConfirmed
  ): RestApiFindAllResponse<DomainT> {
    const returnedSoFar = props.pagesize * props.page;
    return {
      items: response.items.map(processResult),
      next: response.totalCount > returnedSoFar,
    };
  }

  tryFindAll = (
    processResult: EdAppApiFindAllProcessMethod<DomainT, SourceT>,
    props?: EdAppApiFindAllProps
  ): TE.TaskEither<Error, RestApiFindAllResponse<DomainT>> => {
    return TE.tryCatch(
      async () => {
        this.checkChildSupport();
        const realProps = this.confirmFindAllProps(props);
        const uri = this.prepareFindAllUri(realProps);
        const request$ =
          this.httpService.get<EdAppApiFindAllResponse<SourceT>>(uri);
        const response = await firstValueFrom(request$);
        return this.prepareFindAllResponse(
          response.data,
          processResult,
          realProps
        );
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: EdAppApiRepositoryError) => reason as Error
    );
  };

  /**
   * Finds all children of a given parent
   */
  tryFindAllChildren = (
    parentId: string,
    processResult: EdAppApiFindAllProcessMethod<DomainT, SourceT>,
    props?: EdAppApiFindAllProps
  ): TE.TaskEither<Error, RestApiFindAllResponse<DomainT>> => {
    return TE.tryCatch(
      async () => {
        this.checkParentSupport();
        const realProps = this.confirmFindAllProps(props);
        const uri = this.prepareFindAllChildrenUri(parentId, realProps);
        const request$ =
          this.httpService.get<EdAppApiFindAllResponse<SourceT>>(uri);
        const response = await firstValueFrom(request$);
        return this.prepareFindAllResponse(
          response.data,
          processResult,
          realProps
        );
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
   * Create a child record
   *
   * NOTE: EdApp does return a response, but it's not super useful
   *
   * TODO:
   * - [ ] should check for 200 response
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
      (reason: EdAppApiRepositoryError) => reason as Error
    );
  };
}
