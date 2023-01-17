import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';

import {
  CourseSource,
  CourseSourceIdentifier,
} from '../../../domain/entities/course-source';
import {
  CourseSourceFindMethod,
  CourseSourceRepository,
} from '../../ports/course-source.repository';
import { SalesforceApiCourseSourceResponse } from './types/course-source.response';
import { SalesforceApiCourseSourceMapper } from './course-source.mapper';
import { SalesforceApiRepositoryError } from './repository.error-factory';
import { CourseSourceId } from '../../../domain/value-objects/course-source-id';

@Injectable()
export class SalesforceApiCourseSourceRepository
  implements CourseSourceRepository
{
  private sourceName: string;
  private responseType = SalesforceApiCourseSourceResponse;

  constructor(
    private httpService: HttpService,
    private logger: LoggableLogger
  ) {
    this.sourceName = 'Case';
    this.logger.setContext(SalesforceApiCourseSourceRepository.name);
  }

  private fields(): string {
    const rawRunType = this.responseType.omit('attributes');
    return Object.keys(rawRunType.fields).join(',');
  }

  findOneById = (value: CourseSourceId): TE.TaskEither<Error, CourseSource> => {
    return TE.tryCatch(
      async () => {
        const id = CourseSourceId.check(value);
        const endpoint = `sobjects/${this.sourceName}/${id}`;
        this.logger.debug(
          `Finding ${this.sourceName} with endpoint ${endpoint}`
        );
        const fields = this.fields();
        this.logger.verbose(fields);
        const request$ =
          this.httpService.get<SalesforceApiCourseSourceResponse>(endpoint, {
            params: {
              fields,
            },
          });
        const response = await firstValueFrom(request$);

        // NOTE: if not found, an error would have been thrown and caught

        // NOTE: if the response was invalid, an error would have been thrown
        // could this similarly be in a serialisation decorator?
        return SalesforceApiCourseSourceMapper.toDomain(response.data);
      },
      // NOTE: we don't use an error factory here, it is one level up
      (reason: SalesforceApiRepositoryError) => reason as Error
    );
  };

  /**
   * Object lookup for findOneBy methods
   */
  findOneBy: Record<CourseSourceIdentifier, CourseSourceFindMethod> = {
    idSource: this.findOneById,
  };

  findOne = (identifier: CourseSourceIdentifier): CourseSourceFindMethod => {
    return this.findOneBy[identifier];
  };

  save = (courseSource: CourseSource): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        // DO NOTHING
        this.logger.debug(`Temp non-save of ${courseSource.id}`);
      },
      (reason: unknown) => reason as Error
    );
  };
}
