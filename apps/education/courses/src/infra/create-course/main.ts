import { EventBridgeEvent } from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  CreateCourseModule,
  CreateCourseController,
  type CourseBaseResponseDto,
  type ResponsePayload,
} from '@curioushuman/cc-courses-service';
import {
  InternalRequestInvalidError,
  RepositoryItemConflictError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateCourseDtoOrEvent,
  CreateCourseRequestDto,
  locateDto,
} from './dto/request.dto';
import { parseDto, validateRequestPayload } from '@curioushuman/common';

/**
 * TODO
 * - [ ] turn off debug based on ENV
 * - [ ] more unit tests; inc. testing lambda level errors
 */

/**
 * Hold a reference to your Nest app outside of the bootstrap function
 * to minimize cold starts
 * https://towardsaws.com/serverless-love-story-nestjs-lambda-part-i-minimizing-cold-starts-4ba513e5ce02
 */
let lambdaApp: INestApplicationContext;

/**
 * Standalone Nest application for Serverless context
 * i.e. we don't load Express, for optimization purposes
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CreateCourseModule, {
    bufferLogs: true,
  });
  CreateCourseModule.applyDefaults(app);
  return app;
}

async function waitForApp() {
  if (!lambdaApp) {
    lambdaApp = await bootstrap();
  }
  return lambdaApp;
}

/**
 * The official handler for the Lambda function
 *
 * All it does is forward the request on to the Nest application
 * and return the response.
 *
 * NOTES:
 * * ALWAYS THROW THE ERROR, don't catch it and return an error-based response
 *   API Gateway integration response regex only pays attention to errors handled
 *   by AWS.
 * * We receive our own requestDto format, and not the usual AWS resource event.
 *   This will allow us most flexibility in invoking this function from multiple
 *   triggers. It reverses the dependency from invoked > invoker, to invoker > invoked.
 * * We NOW return CourseBaseResponseDto
 */
export const handler = async (
  requestDtoOrEvent: CreateCourseDtoOrEvent
): Promise<ResponsePayload<'course-base'>> => {
  const context = 'CreateCourse.Lambda';
  const logger = new LoggableLogger(context);

  logger.debug
    ? logger.debug(requestDtoOrEvent)
    : logger.log(requestDtoOrEvent);

  // grab the dto
  const requestPayload = parseDto(requestDtoOrEvent, locateDto);

  logger.debug ? logger.debug(requestPayload) : logger.log(requestPayload);

  // validate request
  // NOTE: throws error
  const validRequestDto = validateRequestPayload({
    requestPayload,
    guard: CreateCourseRequestDto.guard,
    logger,
  });

  // init the app
  const app = await waitForApp();
  const createCourseController = app.get(CreateCourseController);

  return createCourseController.create({
    idSourceValue: validRequestDto.idSourceValue,
  });
};
