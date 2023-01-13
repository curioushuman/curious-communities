import * as apigw from 'aws-cdk-lib/aws-apigateway';
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

/**
 * Stack for the admin API endpoints
 *
 * TODO
 * - [ ] hook construct could very easily be moved to cdk-utils
 */
export class ApiAdminStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Over-arching API structure for admin api
     *
     * This will be later, when we have our own system accessing the API
     *
     * /courses
     * /courses/{courseId}
     * /courses/{courseId}/participants
     * /courses/{courseId}/participants/{participantId}
     *
     * This is for external systems to hook into
     *
     * WOULD HAVE PREFERRED, but not possible
     * AWS doesn't like variables of the same name in different "ancestors"
     * /hook/{sourceKey}/external-event/{sourceEvent}/course/{courseSourceId}?{updatedStatus?}
     * /hook/{sourceKey}/external-event/{sourceEvent}/course/{courseSourceId}/participant/{participantSourceId}?{updatedStatus?}
     *
     * This is what works
     * /hook/external-event/course/{sourceKey}/{courseSourceEvent}/{courseSourceId}?{updatedStatus?}
     * /hook/external-event/participant/{sourceKey}/{participantSourceEvent}/{participantSourceId}?{updatedStatus?}
     *
     * TODO
     * - [ ] would the preferred structure be possible if I added a method at the ancestor in question?
     */

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
        message: { type: apigw.JsonSchemaType.STRING },
      },
    });

    /**
     * Other AWS services this stack needs pay attention to
     */

    /**
     * External events eventBus
     */
    const externalEventBusConstruct = new ChEventBusFrom(this, 'cc-external');
    externalEventBusConstruct.eventBus.grantPutEventsTo(apiAdmin.role);

    /**
     * Hooks
     * GET /hook
     */
    const hookResource = apiAdmin.api.root.addResource('hook');

    /**
     * External events hook
     * GET /hook/external-event
     */
    const externalEventResource = hookResource.addResource('external-event');
    const externalEventHookRequestParams = {
      'method.request.path.sourceKey': true,
      'method.request.querystring.updatedStatus': false,
    };

    /**
     * Course Hooks
     * GET /hook/external-event/course/{sourceKey}/{courseSourceEvent}/{courseSourceId}?{updatedStatus?}
     */
    const courseResource = externalEventResource.addResource('course');
    const courseSourceKeyResource = courseResource.addResource('{sourceKey}');
    const courseSourceEventResource = courseSourceKeyResource.addResource(
      '{courseSourceEvent}'
    );
    const courseSourceIdResource =
      courseSourceEventResource.addResource('{courseSourceId}');
    const courseExternalEventHookRequestParams = {
      ...externalEventHookRequestParams,
      'method.request.path.courseSourceEvent': true,
      'method.request.path.courseSourceId': true,
    };

    /**
     * Course hook lambda and co
     */
    const coursesExternalEventHookConstruct = new CoursesHookConstruct(
      this,
      'cc-courses-hook-external-event-course',
      {
        apiConstruct: apiAdmin,
        rootResource: courseSourceIdResource,
        requestParameters: courseExternalEventHookRequestParams,
        eventBus: externalEventBusConstruct.eventBus,
      } as CoursesHookProps
    );

    /**
     * Participant Hooks
     * GET /hook/external-event/participant/{sourceKey}/{participantSourceEvent}/{courseSourceId}/{participantSourceId}?{updatedStatus?}
     */
    const participantResource =
      externalEventResource.addResource('participant');
    const participantSourceKeyResource =
      participantResource.addResource('{sourceKey}');
    const participantSourceEventResource =
      participantSourceKeyResource.addResource('{participantSourceEvent}');
    const participantSourceIdResource =
      participantSourceEventResource.addResource('{participantSourceId}');
    const participantExternalEventHookRequestParams = {
      ...externalEventHookRequestParams,
      'method.request.path.participantSourceEvent': true,
      'method.request.path.participantSourceId': true,
    };

    /**
     * Hook for external events on participants
     * GET /hook/{sourceKey}/external-event/{sourceEvent}/course/{courseSourceId}/participant/{participantSourceId}?{updatedStatus?}
     */
    const participantExternalEventHookConstruct = new ParticipantsHookConstruct(
      this,
      'participants-hook',
      {
        apiConstruct: apiAdmin,
        rootResource: participantSourceIdResource,
        requestParameters: participantExternalEventHookRequestParams,
        eventBus: externalEventBusConstruct.eventBus,
      } as ParticipantsHookProps
    );
  }
}
