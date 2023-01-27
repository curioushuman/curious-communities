import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import { DynamoDbRepositoryErrorFactory } from '@curioushuman/common';

import { CourseRepository } from './adapter/ports/course.repository';
import { FindCourseHandler } from './application/queries/find-course/find-course.query';
import { FindCourseController } from './infra/find-course/find-course.controller';
import { CourseSourceRepository } from './adapter/ports/course-source.repository';
import { CourseRepositoryErrorFactory } from './adapter/ports/course.repository.error-factory';
import { DynamoDbCourseRepository } from './adapter/implementations/dynamodb/course.repository';
import { SalesforceApiCourseSourceRepository } from './adapter/implementations/salesforce/course-source.repository';
import { CourseSourceRepositoryErrorFactory } from './adapter/ports/course-source.repository.error-factory';
import { SalesforceApiRepositoryErrorFactory } from './adapter/implementations/salesforce/repository.error-factory';

const controllers = [FindCourseController];

const handlers = [FindCourseHandler];

const repositories = [
  {
    provide: CourseRepository,
    useClass: DynamoDbCourseRepository,
  },
  {
    provide: CourseSourceRepository,
    useClass: SalesforceApiCourseSourceRepository,
  },
];

const services = [
  {
    provide: CourseRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
  },
  {
    provide: CourseSourceRepositoryErrorFactory,
    useClass: SalesforceApiRepositoryErrorFactory,
  },
];

@Module({
  imports: [CqrsModule, LoggableModule],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class FindCourseModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
