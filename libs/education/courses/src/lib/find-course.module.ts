import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import { DynamoDbRepositoryErrorFactory } from '@curioushuman/common';

import { CourseRepository } from './adapter/ports/course.repository';
import { FindCourseHandler } from './application/queries/find-course/find-course.query';
import { FindCourseController } from './infra/find-course/find-course.controller';
import { CourseRepositoryErrorFactory } from './adapter/ports/course.repository.error-factory';
import { DynamoDbCourseRepository } from './adapter/implementations/dynamodb/course.repository';

const controllers = [FindCourseController];

const handlers = [FindCourseHandler];

const repositories = [
  {
    provide: CourseRepository,
    useClass: DynamoDbCourseRepository,
  },
];

const services = [
  {
    provide: CourseRepositoryErrorFactory,
    useClass: DynamoDbRepositoryErrorFactory,
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
