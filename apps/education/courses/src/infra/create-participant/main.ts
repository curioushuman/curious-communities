import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  CreateParticipantModule,
  CreateParticipantController,
  ResponsePayload,
} from '@curioushuman/cc-courses-service';
import { LoggableLogger } from '@curioushuman/loggable';
import { parseDto, validateRequestPayload } from '@curioushuman/common';

import {
  CreateParticipantDtoOrEvent,
  CreateParticipantRequestDto,
  locateDto,
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
    CreateParticipantModule,
    {
      bufferLogs: true,
    }
  );
  CreateParticipantModule.applyDefaults(app);
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
  requestDtoOrEvent: CreateParticipantDtoOrEvent
): Promise<ResponsePayload<'participant'>> => {
  const context = 'CreateParticipant.Lambda';
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
    checkRequest: CreateParticipantRequestDto.guard,
    logger,
  });

  // init the app
  const app = await waitForApp();
  const createParticipantController = app.get(CreateParticipantController);

  return createParticipantController.create({
    participantSource: validRequestDto.participantSource,
    course: validRequestDto.course,
    member: validRequestDto.member,
  });
};
