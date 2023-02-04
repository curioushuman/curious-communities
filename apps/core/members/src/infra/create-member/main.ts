import { EventBridgeEvent } from 'aws-lambda';
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  MutateMemberModule,
  CreateMemberController,
  MemberResponseDto,
} from '@curioushuman/cc-members-service';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import { CreateMemberRequestDto } from './dto/request.dto';

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
  requestDtoOrEvent:
    | CreateMemberRequestDto
    | EventBridgeEvent<'putEvent', CreateMemberRequestDto>
): Promise<MemberResponseDto | void> => {
  // grab the dto
  const requestDto =
    'detail' in requestDtoOrEvent
      ? requestDtoOrEvent.detail
      : requestDtoOrEvent;

  const logger = new LoggableLogger('CreateMemberFunction.handler');
  logger.debug ? logger.debug(requestDto) : logger.log(requestDto);

  // lambda level validation
  if (!CreateMemberRequestDto.guard(requestDto)) {
    // NOTE: this is a 500 error, not a 400
    const error = new InternalRequestInvalidError(
      'Invalid request sent to CreateMemberFunction.Lambda'
    );
    // we straight out log this, as it's a problem our systems
    // aren't communicating properly.
    logger.error(error);
    throw error;
  }

  // init the app
  const app = await waitForApp();
  const createMemberController = app.get(CreateMemberController);

  // call the controller
  // TODO: replace this with a try/catch, and throw the error in the controller
  return createMemberController.create({
    email: requestDto.memberEmail,
    idSourceValue: requestDto.memberIdSourceValue,
  });
};
