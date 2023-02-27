import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  UpdateParticipantModule,
  UpdateParticipantController,
  ResponsePayload,
} from '@curioushuman/cc-courses-service';
import { LoggableLogger } from '@curioushuman/loggable';
import { parseDto, validateRequestPayload } from '@curioushuman/common';

import {
  locateDto,
  UpdateParticipantDtoOrEvent,
  UpdateParticipantRequestDto,
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
    UpdateParticipantModule,
    {
      bufferLogs: true,
    }
  );
  UpdateParticipantModule.applyDefaults(app);
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
  requestDtoOrEvent: UpdateParticipantDtoOrEvent
): Promise<ResponsePayload<'participant'>> => {
  // grab the dto
  const requestPayload = parseDto(requestDtoOrEvent, locateDto);

  const context = 'UpdateParticipant.Lambda';
  const logger = new LoggableLogger(context);

  // log the request
  logger.debug ? logger.debug(requestPayload) : logger.log(requestPayload);

  // validate request
  // NOTE: throws error
  const validRequestDto = validateRequestPayload({
    requestPayload,
    checkRequest: UpdateParticipantRequestDto.guard,
    logger,
  });

  // init the app
  const app = await waitForApp();
  const updateParticipantController = app.get(UpdateParticipantController);

  // perform the action
  // NOTE: no try/catch here. According to the docs:
  //  _"For async handlers, you can use `return` and `throw` to send a `response`
  //    or `error`, respectively. Functions must use the async keyword to use
  //    these methods to return a `response` or `error`."_
  //    https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html
  // Error will be thrown during `executeTask` within the controller.
  // SEE **Error handling and logging** in README for more info.
  return updateParticipantController.update({
    idSourceValue: validRequestDto.participantIdSourceValue,
  });
};
