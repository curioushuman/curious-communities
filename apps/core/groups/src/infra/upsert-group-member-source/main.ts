import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  upsertGroupMemberSourceModules,
  UpsertGroupMemberSourceController,
  GroupMemberSourceResponseDto,
  ResponsePayload,
} from '@curioushuman/cc-groups-service';
import {
  InternalRequestInvalidError,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';
import {
  checkForNullRequestPayload,
  parseDto,
  validateRequestPayload,
} from '@curioushuman/common';

import {
  locateDto,
  UpsertGroupMemberSourceDtoOrEvent,
  UpsertGroupMemberSourceRequestDto,
} from './dto/request.dto';

/**
 * TODO
 * - [ ] turn off debug based on ENV
 * - [ ] more unit tests; inc. testing lambda level errors
 */

/**
 * Init a logger
 */
const logger = new LoggableLogger('UpsertGroupMemberSource.lambda');

/**
 * Hold a reference to your Nest app outside of the bootstrap function
 * to minimize cold starts
 * https://towardsaws.com/serverless-love-story-nestjs-lambda-part-i-minimizing-cold-starts-4ba513e5ce02
 */
const lambdaApps: Record<string, INestApplicationContext> = {};

/**
 * Standalone Nest application for Serverless context
 * i.e. we don't load Express, for optimization purposes
 */
async function bootstrap(source: string) {
  if (!(source in upsertGroupMemberSourceModules)) {
    const error = new RequestInvalidError(`Source ${source} is not supported`);
    logger.error(error);
    throw error;
  }
  const app = await NestFactory.createApplicationContext(
    upsertGroupMemberSourceModules[source],
    {
      bufferLogs: true,
    }
  );
  if ('applyDefaults' in upsertGroupMemberSourceModules[source]) {
    upsertGroupMemberSourceModules[source].applyDefaults(app);
  }
  return app;
}

async function waitForApp(source: string) {
  if (!lambdaApps[source]) {
    lambdaApps[source] = await bootstrap(source);
  }
  return lambdaApps[source];
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
 * * We return the entity, for further application processing
 *
 * TODO:
 * - [ ] I'm not super chuffed about handing source in as a value (to controller)
 */
export const handler = async (
  requestDtoOrEvent: UpsertGroupMemberSourceDtoOrEvent
): Promise<ResponsePayload<'group-member-source'>> => {
  const context = 'UpsertGroupMemberSource.Lambda';
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

  // lambda level validation
  // NOTE: throws error
  const validRequestDto = validateRequestPayload({
    requestPayload,
    checkRequest: UpsertGroupMemberSourceRequestDto.guard,
    logger,
  });

  // init the app
  const app = await waitForApp(validRequestDto.source);
  const upsertGroupMemberSourceController = app.get(
    UpsertGroupMemberSourceController
  );

  // perform the action
  // NOTE: no try/catch here. According to the docs:
  //  _"For async handlers, you can use `return` and `throw` to send a `response`
  //    or `error`, respectively. Functions must use the async keyword to use
  //    these methods to return a `response` or `error`."_
  //    https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html
  // Error will be thrown during `executeTask` within the controller.
  // SEE **Error handling and logging** in README for more info.
  return upsertGroupMemberSourceController.upsert({
    source: validRequestDto.source,
    groupMember: validRequestDto.groupMember,
  });
};
