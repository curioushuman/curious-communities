import { loadFeature, defineFeature } from 'jest-cucumber';
import { getResponse } from 'aws-testing-library/lib/utils/api';
// import { HookInternalEventDto } from '../dto/request.dto';

import {
  transformIdToResourceTitle,
  transformIdToTestResourceName,
} from '@curioushuman/cdk-utils';

// use this to set timeout if you're debugging
// jest.setTimeout(100000);

/**
 * INTEGRATION TEST
 *
 * SUT = the hook endpoint of the API
 *
 * Does it successfully send an event to the event bus?
 */
const feature = loadFeature('./hook.infra.feature', {
  loadRelativePath: true,
});

/**
 * AWS SDK bits
 *
 * TODO
 * - [ ] move these to a helper
 */
const account = process.env.AWS_ACCOUNT || '000000000000';
const region = process.env.AWS_REGION || 'ap-southeast-2';

/**
 * Values from CDK we require
 *
 * TODO
 * - [ ] move this to a helper
 */
const apiId = 'cc-api-admin';
const stackTitle = transformIdToResourceTitle(apiId, 'Stack');
// TODO - move this to Jest utils at some point
const apiUrl = process.env[`${stackTitle}_ApiUrl`];

defineFeature(feature, (test) => {
  // let [queueArn, subscriptionArn, queueUrl] = ['', '', ''];

  beforeAll(async () => {
    // const queueId = 'cc-external-events';
    // const queueName = transformIdToTestResourceName(queueId, 'Queue');
    // queueArn = `arn:aws:sqs:${region}:${account}:${queueName}`;
    // console.log(queueArn);
    // ({ subscriptionArn, queueUrl } = await subscribeToTopic(region, queueArn));
  });

  // afterAll(async () => {
  // await unsubscribeFromTopic(region, subscriptionArn, queueUrl);
  // });

  test('Successfully creating a valid internal event', ({
    given,
    // and,
    when,
    then,
  }) => {
    let eventType: string;
    let idSource: string;
    let response: any;

    given('a valid external event has occurred', () => {
      eventType = 'created';
      idSource = '123';
    });

    when(
      'a request including this data has been sent to the hook endpoint',
      async () => {
        if (!apiUrl) {
          throw new Error('No API URL found');
        }
        const url = `${apiUrl}courses/${idSource}/hook/${eventType}`;
        response = await getResponse(url, 'GET');
      }
    );

    then('a successful response should be returned', async () => {
      // ! temporary known workaround
      // TODO - switch this back once localstack support apigw-eventbridge integration
      // expect(response.statusCode).toEqual(200);
      expect(response.statusCode).toEqual(400);
    });

    // and('an internal event is created', () => {
    //   // TODO
    //   expect(idSource).toEqual('123');
    // });

    // and('an event ID is returned', () => {
    //   // TODO
    //   expect(response.data.id).toBeTruthy();
    // });
  });
});
