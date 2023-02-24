import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  UpsertMemberSourceMultiModule,
  UpsertMemberSourceMultiController,
} from '@curioushuman/cc-members-service';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';
import {
  checkForNullRequestPayload,
  parseDto,
  validateRequestPayload,
} from '@curioushuman/common';

import {
  locateDto,
  UpsertMemberSourceMultiRequestDto,
  UpsertMemberSourceMultiDtoOrEvent,
} from './dto/request.dto';

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
    UpsertMemberSourceMultiModule,
    {
      bufferLogs: true,
    }
  );
  UpsertMemberSourceMultiModule.applyDefaults(app);
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
 * - unfortunately we need to deal with null input here
 *   I'm unable to add content filtering rules to eventBus event pattern
 *
 * TODO:
 * - [ ] consider a different return type in the other lambda that includes success/failure
 */
export const handler = async (
  requestDtoOrEvent: UpsertMemberSourceMultiDtoOrEvent
): Promise<void> => {
  // grab the dto
  const requestPayload = parseDto(requestDtoOrEvent, locateDto);

  const context = 'UpsertMemberSourceMulti.Lambda';
  const logger = new LoggableLogger(context);

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
    checkRequest: UpsertMemberSourceMultiRequestDto.guard,
    logger,
  });

  // init the app
  const app = await waitForApp();
  const upsertMemberSourceMultiController = app.get(
    UpsertMemberSourceMultiController
  );

  // perform the action
  // NOTE: no try/catch here. According to the docs:
  //  _"For async handlers, you can use `return` and `throw` to send a `response`
  //    or `error`, respectively. Functions must use the async keyword to use
  //    these methods to return a `response` or `error`."_
  //    https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html
  // Error will be thrown during `executeTask` within the controller.
  // SEE **Error handling and logging** in README for more info.
  return upsertMemberSourceMultiController.upsert({
    member: validRequestDto.member,
  });
};
