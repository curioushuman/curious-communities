import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';
import {
  SalesforceApiRepositoryError,
  SalesforceApiSourceRepository,
} from '@curioushuman/common';

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
import { CourseSourceId } from '../../../domain/value-objects/course-source-id';

@Injectable()
export class SalesforceApiCourseSourceRepository
  extends SalesforceApiSourceRepository
  implements CourseSourceRepository
{
  constructor(public httpService: HttpService, public logger: LoggableLogger) {
    super('Case', SalesforceApiCourseSourceResponse);
    this.logger.setContext(SalesforceApiCourseSourceRepository.name);
  }

  findOneById = (value: CourseSourceId): TE.TaskEither<Error, CourseSource> => {
    return TE.tryCatch(
      async () => {
        const id = CourseSourceId.check(value);
        const endpoint = this.prepareFindOneUri(id);
        const fields = this.fields();
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
