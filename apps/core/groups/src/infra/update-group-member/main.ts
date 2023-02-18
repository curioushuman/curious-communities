import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  UpdateGroupMemberModule,
  UpdateGroupMemberController,
  GroupMemberResponseDto,
} from '@curioushuman/cc-groups-service';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';
import { parseDto } from '@curioushuman/common';

import {
  locateDto,
  UpdateGroupMemberDtoOrEvent,
  UpdateGroupMemberRequestDto,
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
    UpdateGroupMemberModule,
    {
      bufferLogs: true,
    }
  );
  UpdateGroupMemberModule.applyDefaults(app);
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
  requestDtoOrEvent: UpdateGroupMemberDtoOrEvent
): Promise<GroupMemberResponseDto | void> => {
  // grab the dto
  const requestDto = parseDto(requestDtoOrEvent, locateDto);

  // check for an immediate null
  if (requestDto === null) {
    // if it's null, it means nothing was created or updated
    // TODO: there will be a better way to handle this
    // but I'm uncertain of it for now
    return;
  }

  const logger = new LoggableLogger('UpdateGroupMemberFunction.handler');
  logger.debug ? logger.debug(requestDto) : logger.log(requestDto);

  // lambda level validation
  if (!requestDto || !UpdateGroupMemberRequestDto.guard(requestDto)) {
    // NOTE: this is a 500 error, not a 400
    const error = new InternalRequestInvalidError(
      'Invalid request sent to UpdateGroupMemberFunction.Lambda'
    );
    // we straight out log this, as it's a problem our systems
    // aren't communicating properly.
    logger.error(error);
    throw error;
  }

  // init the app
  const app = await waitForApp();
  const controller = app.get(UpdateGroupMemberController);

  // try/catch doesn't work at this level
  return controller.update({
    groupMember: requestDto.groupMember,
  });
};
