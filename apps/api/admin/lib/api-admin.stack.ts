import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  CoApiConstruct,
  resourceNameTitle,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import {
  CoursesHookConstruct,
  CoursesHookProps,
} from '../src/infra/hook-course/hook.construct';
import {
  ParticipantsHookConstruct,
  ParticipantsHookProps,
} from '../src/infra/hook-participant/hook.construct';

export class ApiAdminStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * API Gateway
     */
    const apiAdmin = new CoApiConstruct(this, 'cc-api-admin', {
      description: 'Education Admin API',
      stageName: 'dev',
    });

    /**
     * API Gateway Response models
     *
     * NOTES
     * - currently all endpoints are hooks, so we'll use a single response model
     */
    apiAdmin.addResponseModel('hook-event-success', {
      properties: {
        message: { type: apigateway.JsonSchemaType.STRING },
      },
    });

    /**
     * Other AWS services this stack needs pay attention to
     */

    /**
     * External events eventBus
     */
    const externalEventsEventBusId = 'cc-external-events';
    const [externalEventsEventBusName, externalEventsEventBusTitle] =
      resourceNameTitle(externalEventsEventBusId, 'EventBus');
    const externalEventsEventBus = events.EventBus.fromEventBusArn(
      this,
      externalEventsEventBusTitle,
      `arn:aws:events:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:event-bus:${externalEventsEventBusName}`
    );
    externalEventsEventBus.grantPutEventsTo(apiAdmin.role);

    /**
     * Common response models
     * i.e. these are the structures for data that will be returned from THIS API
     */

    /**
     * Courses
     */
    const courses = apiAdmin.api.root.addResource('courses');
    const coursesExternalId = courses.addResource('{externalId}');

    /**
     * Hook for external events
     * GET /courses/{externalId}/hook/{eventType}?{updatedStatus?}
     */
    const coursesHookConstruct = new CoursesHookConstruct(
      this,
      'courses-hook',
      {
        apiConstruct: apiAdmin,
        rootResource: coursesExternalId.addResource('hook'),
        eventBus: externalEventsEventBus,
      } as CoursesHookProps
    );

    /**
     * Participants
     */
    const participants = coursesExternalId.addResource('participants');
    const participantsPaxExternalId = courses.addResource('{paxExternalId}');

    /**
     * Hook for external events
     * GET /courses/{externalId}/participants/{paxExternalId}/hook/{eventType}?{updatedStatus?}
     */
    const participantsHookConstruct = new ParticipantsHookConstruct(
      this,
      'participants-hook',
      {
        apiConstruct: apiAdmin,
        rootResource: participantsPaxExternalId.addResource('hook'),
        eventBus: externalEventsEventBus,
      } as ParticipantsHookProps
    );
  }
}
