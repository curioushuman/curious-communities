import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';

import { CourseSource } from '../../../domain/entities/course-source';
import { CourseSourceRepository } from '../../ports/course-source.repository';
import { FindCourseSourceDto } from '../../../application/queries/find-course-source/find-course-source.dto';
import { SalesforceApiCourseSourceResponse } from './types/course-source.response';
import { SalesforceApiCourseSourceMapper } from './course-source.mapper';
import { SalesforceApiRepositoryError } from './repository.error-factory';

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

  // private fields<T>(salesforceResponseRuntype: Record<T>): string[] {
  private fields(): string {
    const rawRunType = this.responseType.omit('attributes');
    return Object.keys(rawRunType.fields).join(',');
  }

  findOne = (dto: FindCourseSourceDto): TE.TaskEither<Error, CourseSource> => {
    const { id } = dto;
    const endpoint = `sobjects/${this.sourceName}/${id}`;
    this.logger.debug(`Finding ${this.sourceName} with endpoint ${endpoint}`);
    const fields = this.fields();
    this.logger.verbose(fields);
    return TE.tryCatch(
      async () => {
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
