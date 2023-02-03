import { EventBridgeEvent } from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  CreateCourseModule,
  CreateCourseController,
  type CourseBaseResponseDto,
} from '@curioushuman/cc-courses-service';
import {
  InternalRequestInvalidError,
  RepositoryItemConflictError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import { CreateCourseRequestDto } from './dto/request.dto';

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
  requestDtoOrEvent:
    | CreateCourseRequestDto
    | EventBridgeEvent<'putEvent', CreateCourseRequestDto>
): Promise<CourseBaseResponseDto | void> => {
  // grab the dto
  const requestDto =
    'detail' in requestDtoOrEvent
      ? requestDtoOrEvent.detail
      : requestDtoOrEvent;

  const logger = new LoggableLogger('CreateCourseFunction.handler');
  logger.debug ? logger.debug(requestDto) : logger.log(requestDto);

  // lambda level validation
  if (!CreateCourseRequestDto.guard(requestDto)) {
    // NOTE: this is a 500 error, not a 400
    const error = new InternalRequestInvalidError(
      'Invalid request sent to CreateCourseFunction.Lambda'
    );
    // we straight out log this, as it's a problem our systems
    // aren't communicating properly.
    logger.error(error);
    throw error;
  }

  // init the app
  const app = await waitForApp();
  const createCourseController = app.get(CreateCourseController);

  // we're going to try catch here
  // only to catch RepositoryItemConflictError
  // to log it, not throw it
  // to avoid the lambda retrying
  try {
    return createCourseController.create({
      idSourceValue: requestDto.courseIdSourceValue,
    });
  } catch (error: unknown) {
    if (error instanceof RepositoryItemConflictError) {
      logger.log(error);
      return;
    }
    throw error;
  }
};
