import * as cdk from 'aws-cdk-lib';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ApiGwHookExternalEventConstruct,
  ApiGwHookExternalEventProps,
  ChEventBusFrom,
  CoApiConstruct,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

/**
 * Stack for the admin API endpoints
 *
 * TODO
 * - [ ] hook construct could very easily be moved to cdk-utils
 */
export class ApiAdminStack extends cdk.Stack {
  constructor(scope: cdk.App, stackId: string, props?: cdk.StackProps) {
    super(scope, stackId, props);

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
    const apiAdmin = new CoApiConstruct(this, stackId, {
      description: 'Education Admin API',
      stageName: 'dev',
    });

    /**
     * Other AWS services this stack needs pay attention to
     */

    /**
     * External events eventBus
     */
    const externalEventBusConstruct = new ChEventBusFrom(
      this,
      'cc-events-external'
    );
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

    /**
     * Courses external event hook
     *
     * * NOTE: this does everything but the path.yaml file
     *         please include this in the relevant infra dir
     */
    const coursesExternalEventHookConstruct =
      new ApiGwHookExternalEventConstruct(this, 'course', {
        apiConstruct: apiAdmin,
        rootResource: externalEventResource,
        eventBus: externalEventBusConstruct.eventBus,
      } as ApiGwHookExternalEventProps);

    /**
     * Participants external event hook
     *
     * * NOTE: this does everything but the path.yaml file
     *         please include this in the relevant infra dir
     */
    const participantsExternalEventHookConstruct =
      new ApiGwHookExternalEventConstruct(this, 'participant', {
        apiConstruct: apiAdmin,
        rootResource: externalEventResource,
        eventBus: externalEventBusConstruct.eventBus,
      } as ApiGwHookExternalEventProps);

    /**
     * Members external event hook
     *
     * * NOTE: this does everything but the path.yaml file
     *         please include this in the relevant infra dir
     */
    const membersExternalEventHookConstruct =
      new ApiGwHookExternalEventConstruct(this, 'member', {
        apiConstruct: apiAdmin,
        rootResource: externalEventResource,
        eventBus: externalEventBusConstruct.eventBus,
      } as ApiGwHookExternalEventProps);
  }
}
