import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  UpdateCourseMultiModule,
  UpdateCourseMultiController,
} from '@curioushuman/cc-courses-service';
import { timezoneTimestampOffset } from '@curioushuman/common';

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
    UpdateCourseMultiModule,
    {
      bufferLogs: true,
    }
  );
  UpdateCourseMultiModule.applyDefaults(app);
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
export const handler = async (): Promise<void> => {
  // create the date range to check
  // NOTE: these date ranges are for a 1am check, and midnight opens
  // if you want to get more specific, bring this to 2, and hourly checks
  // const start = timezoneTimestampOffset(-4);
  // -10 is for testing
  const start = timezoneTimestampOffset(-10);
  const end = timezoneTimestampOffset(1);

  // init the app
  const app = await waitForApp();
  const controller = app.get(UpdateCourseMultiController);

  return controller.update({
    dateOpenRange: {
      start,
      end,
    },
    status: 'closed',
  });
};
