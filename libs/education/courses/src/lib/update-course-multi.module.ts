import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';
import { DynamoDbRepositoryErrorFactory } from '@curioushuman/common';
import { CourseRepository } from './adapter/ports/course.repository';
import { DynamoDbCourseRepository } from './adapter/implementations/dynamodb/course.repository';
import { CourseRepositoryErrorFactory } from './adapter/ports/course.repository.error-factory';
import { UpdateCourseMultiController } from './infra/update-course-multi/update-course-multi.controller';
import { CoursesQueueService } from './adapter/ports/courses.queue-service';
import { SqsCoursesQueueService } from './adapter/implementations/sqs/courses.queue-service';
import { FindCoursesHandler } from './application/queries/find-courses/find-courses.query';

const imports = [CqrsModule, LoggableModule];

const controllers = [UpdateCourseMultiController];

const handlers = [FindCoursesHandler];

const repositories = [
  {
    provide: CourseRepository,
    useClass: DynamoDbCourseRepository,
  },
];

const services = [
  {
    provide: CoursesQueueService,
    useClass: SqsCoursesQueueService,
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
export class UpdateCourseMultiModule {
  public static applyDefaults(app: INestApplicationContext) {
    app.useLogger(new LoggableLogger());
  }
}
