import { INestApplicationContext, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import {
  DynamoDbRepositoryErrorFactory,
  SalesforceApiHttpConfigService,
  SalesforceApiRepositoryErrorFactory,
} from '@curioushuman/common';

import { CourseRepository } from './adapter/ports/course.repository';
import { CreateCourseHandler } from './application/commands/create-course/create-course.command';
import { CreateCourseController } from './infra/create-course/create-course.controller';
import { CourseSourceRepository } from './adapter/ports/course-source.repository';
import { SalesforceApiCourseSourceRepository } from './adapter/implementations/salesforce/course-source.repository';
import { CourseSourceRepositoryErrorFactory } from './adapter/ports/course-source.repository.error-factory';
import { CourseRepositoryErrorFactory } from './adapter/ports/course.repository.error-factory';
import { FindCourseHandler } from './application/queries/find-course/find-course.query';
import { FindCourseSourceHandler } from './application/queries/find-course-source/find-course-source.query';
import { DynamoDbCourseRepository } from './adapter/implementations/dynamodb/course.repository';

const imports = [
  CqrsModule,
  LoggableModule,
  HttpModule.registerAsync({
    useClass: SalesforceApiHttpConfigService,
  }),
];

const controllers = [CreateCourseController];

const handlers = [
  CreateCourseHandler,
  FindCourseHandler,
  FindCourseSourceHandler,
];

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
    provide: CourseSourceRepositoryErrorFactory,
    useClass: SalesforceApiRepositoryErrorFactory,
  },
  {
    provide: CourseRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
  },
];

@Module({
  imports: [...imports],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class CreateCourseModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
