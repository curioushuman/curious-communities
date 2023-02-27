import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  MutateMemberModule,
  CreateMemberController,
  ResponsePayload,
} from '@curioushuman/cc-members-service';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateMemberDtoOrEvent,
  CreateMemberRequestDto,
  locateDto,
} from './dto/request.dto';
import {
  checkForNullRequestPayload,
  parseDto,
  validateRequestPayload,
} from '@curioushuman/common';

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
  const app = await NestFactory.createApplicationContext(MutateMemberModule, {
    bufferLogs: true,
  });
  MutateMemberModule.applyDefaults(app);
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
 * _ I would prefer to catch a RepositoryItemConflictError and return void here
 *
 * TODO:
 * - [ ] consider a different return type that includes success/failure
 *       i.e. instead of void being indicative of unnecessary create, we could return
 *       an object that includes the result, and the member if necessary
 */
export const handler = async (
  requestDtoOrEvent: CreateMemberDtoOrEvent
): Promise<ResponsePayload<'member'>> => {
  const context = 'CreateMember.Lambda';
  const logger = new LoggableLogger(context);

  logger.debug
    ? logger.debug(requestDtoOrEvent)
    : logger.log(requestDtoOrEvent);

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
    checkRequest: CreateMemberRequestDto.guard,
    logger,
  });

  // init the app
  const app = await waitForApp();
  const createMemberController = app.get(CreateMemberController);

  // call the controller
  // TODO: replace this with a try/catch, and throw the error in the controller
  return createMemberController.create({
    email: validRequestDto.memberEmail,
    idSourceValue: validRequestDto.memberIdSourceValue,
  });
};
