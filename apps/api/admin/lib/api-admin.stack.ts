import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChEventBusFrom,
  CoApiConstruct,
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
    const externalEventBusConstruct = new ChEventBusFrom(
      this,
      'cc-eventbus-external'
    );
    externalEventBusConstruct.eventBus.grantPutEventsTo(apiAdmin.role);

    /**
     * Common response models
     * i.e. these are the structures for data that will be returned from THIS API
     */

    /**
     * Courses
     */
    const courses = apiAdmin.api.root.addResource('courses');
    const coursesCourse = courses.addResource('{courseIdSourceValue}');

    /**
     * Hook for external events
     * GET /courses/{courseIdSourceValue}/hook/{eventType}?{updatedStatus?}
     */
    const coursesHookConstruct = new CoursesHookConstruct(
      this,
      'courses-hook',
      {
        apiConstruct: apiAdmin,
        rootResource: coursesCourse.addResource('hook'),
        eventBus: externalEventBusConstruct.eventBus,
      } as CoursesHookProps
    );

    /**
     * Participants
     */
    const participants = coursesCourse.addResource('participants');
    const participantsParticipant =
      participants.addResource('{paxIdSourceValue}');

    /**
     * Hook for external events
     * GET /courses/{courseIdSourceValue}/participants/{paxIdSourceValue}/hook/{eventType}?{updatedStatus?}
     */
    const participantsHookConstruct = new ParticipantsHookConstruct(
      this,
      'participants-hook',
      {
        apiConstruct: apiAdmin,
        rootResource: participantsParticipant.addResource('hook'),
        eventBus: externalEventBusConstruct.eventBus,
      } as ParticipantsHookProps
    );
  }
}
