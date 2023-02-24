import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  UpsertCourseGroupModule,
  UpsertCourseGroupController,
  ResponsePayload,
} from '@curioushuman/cc-groups-service';
import { LoggableLogger } from '@curioushuman/loggable';
import {
  checkForNullRequestPayload,
  parseDto,
  validateRequestPayload,
} from '@curioushuman/common';

import {
  locateDto,
  UpsertCourseGroupDtoOrEvent,
  UpsertCourseGroupRequestDto,
} from './dto/request.dto';

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
  const app = await NestFactory.createApplicationContext(
    UpsertCourseGroupModule,
    {
      bufferLogs: true,
    }
  );
  UpsertCourseGroupModule.applyDefaults(app);
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
 * * We return void
 *   Which basically indicates success.
 */
export const handler = async (
  requestDtoOrEvent: UpsertCourseGroupDtoOrEvent
): Promise<ResponsePayload<'course-group-base'>> => {
  // init the logger
  const context = 'UpsertCourseGroup.Lambda';
  const logger = new LoggableLogger(context);

  // grab the dto
  const requestPayload = parseDto(requestDtoOrEvent, locateDto);

  // check for an immediate null; this was legacy behaviour
  // NOTE: throws error
  checkForNullRequestPayload({
    requestPayload,
    logger,
  });

  // log the request
  logger.debug ? logger.debug(requestPayload) : logger.log(requestPayload);

  // validate request
  // NOTE: throws error
  const validRequestDto = validateRequestPayload({
    requestPayload,
    checkRequest: UpsertCourseGroupRequestDto.guard,
    logger,
  });

  // init the app
  const app = await waitForApp();
  const controller = app.get(UpsertCourseGroupController);

  // try/catch doesn't work at this level
  return controller.upsert({
    course: validRequestDto.course,
  });
};
