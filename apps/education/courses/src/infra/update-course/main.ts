import { EventBridgeEvent } from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  UpdateCourseModule,
  UpdateCourseController,
  CourseResponseDto,
} from '@curioushuman/cc-courses-service';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import { UpdateCourseRequestDto } from './dto/request.dto';

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
  const app = await NestFactory.createApplicationContext(UpdateCourseModule, {
    bufferLogs: true,
  });
  UpdateCourseModule.applyDefaults(app);
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
  requestDtoOrEvent:
    | UpdateCourseRequestDto
    | EventBridgeEvent<'putEvent', UpdateCourseRequestDto>
): Promise<CourseResponseDto> => {
  // grab the dto
  const requestDto =
    'detail' in requestDtoOrEvent
      ? requestDtoOrEvent.detail
      : requestDtoOrEvent;

  const logger = new LoggableLogger('UpdateCourseFunction.handler');
  logger.debug ? logger.debug(requestDto) : logger.log(requestDto);

  // lambda level validation
  if (!UpdateCourseRequestDto.guard(requestDto)) {
    // NOTE: this is a 500 error, not a 400
    const error = new InternalRequestInvalidError(
      'Invalid request sent to UpdateCourseFunction.Lambda'
    );
    // we straight out log this, as it's a problem our systems
    // aren't communicating properly.
    logger.error(error);
    throw error;
  }

  // init the app
  const app = await waitForApp();
  const updateCourseController = app.get(UpdateCourseController);

  // perform the action
  // NOTE: no try/catch here. According to the docs:
  //  _"For async handlers, you can use `return` and `throw` to send a `response`
  //    or `error`, respectively. Functions must use the async keyword to use
  //    these methods to return a `response` or `error`."_
  //    https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html
  // Error will be thrown during `executeTask` within the controller.
  // SEE **Error handling and logging** in README for more info.
  return updateCourseController.update(requestDto);
};
