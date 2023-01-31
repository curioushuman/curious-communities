import { LoggableLogger } from '@curioushuman/loggable';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';

import {
  Auth0ApiFindOneProcessMethod,
  Auth0ApiRepositoryProps,
} from './auth0.repository.types';
import { Auth0ApiRepositoryError } from './repository.error-factory.types';
import { URLSearchParams } from 'url';
import { Auth0ApiResponses } from './types/base-response';

/**
 * E is for entity
 * R is for response type (from Auth0)
 */
export class Auth0ApiRepository<DomainT, ResponseT> {
  private readonly sourceName: string;
  private readonly responseRuntype: Auth0ApiRepositoryProps['responseRuntype'];

  constructor(
    props: Auth0ApiRepositoryProps,
    private httpService: HttpService,
    private logger: LoggableLogger
  ) {
    this.sourceName = props.sourceName;
    this.responseRuntype = props.responseRuntype;
  }

  protected fields(): string {
    const fields = Object.keys(this.responseRuntype.fields).join(',');
    this.logger.verbose(fields);
    return fields;
  }

  protected prepareFindOneUri(id: string): string {
    const endpoint = `${this.sourceName}/${id}`;
    this.logger.debug(`Finding ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  protected prepareFindOneByEmailUri(email: string): string {
    const params = new URLSearchParams({
      email,
      fields: this.fields(),
    });
    const endpoint = `${this.sourceName}-by-email?${params.toString()}`;

    this.logger.debug(`Finding ${this.sourceName} with uri ${endpoint}`);
    return endpoint;
  }

  /**
   * ? should id be a more specific type?
   */
  tryFindOne = (
    id: string,
    processResult: Auth0ApiFindOneProcessMethod<DomainT, ResponseT>
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
      (reason: Auth0ApiRepositoryError) => reason as Error
    );
  };

  tryFindOneByEmail = (
    email: string,
    processResult: Auth0ApiFindOneProcessMethod<DomainT, ResponseT>
  ): TE.TaskEither<Error, DomainT> => {
    return TE.tryCatch(
      async () => {
        const uri = this.prepareFindOneByEmailUri(email);
        const request$ =
          this.httpService.get<Auth0ApiResponses<ResponseT>>(uri);
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        return processResult(response.data[0], uri);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: Auth0ApiRepositoryError) => reason as Error
    );
  };
}
