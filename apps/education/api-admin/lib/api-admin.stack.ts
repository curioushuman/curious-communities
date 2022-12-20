import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  CoApiConstruct,
  resourceNameTitle,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import { HookConstruct, HookProps } from '../src/courses/hook/hook.construct';

export class ApiAdminStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * API Gateway
     */
    const apiAdmin = new CoApiConstruct(this, 'ue-api-admin', {
      description: 'Education Admin API',
      stageName: 'dev',
    });

    /**
     * Other AWS services this stack needs pay attention to
     */

    /**
     * External events eventBus
     */
    const externalEventsEventBusId = 'ue-external-events';
    const [externalEventsEventBusName, externalEventsEventBusTitle] =
      resourceNameTitle(externalEventsEventBusId, 'EventBus');
    const externalEventsEventBus = events.EventBus.fromEventBusArn(
      this,
      externalEventsEventBusTitle,
      `arn:aws:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:${externalEventsEventBusName}`
    );
    externalEventsEventBus.grantPutEventsTo(apiAdmin.role);

    /**
     * Common response models
     * i.e. these are the structures for data that will be returned from THIS API
     */

    /**
     * Course
     *
     * TODO
     * - [ ] can we move this to a schema dir or similar
     * - [ ] we also need to align with the openapi schema yaml
     */
    // was removed as we don't have a find anymore
    // apiAdmin.addResponseModel('course-response-dto', {
    //   properties: {
    //     id: { type: apigateway.JsonSchemaType.STRING },
    //     externalId: { type: apigateway.JsonSchemaType.STRING },
    //     name: { type: apigateway.JsonSchemaType.STRING },
    //     slug: { type: apigateway.JsonSchemaType.STRING },
    //   },
    // });

    /**
     * Courses
     */
    const courses = apiAdmin.api.root.addResource('courses');

    /**
     * Hook for external events
     * GET /courses/{eventType}/{externalId}?{updatedStatus?}
     */
    const coursesHookConstruct = new HookConstruct(this, 'courses-hook', {
      apiConstruct: apiAdmin,
      rootResource: courses.addResource('hook'),
      eventBus: externalEventsEventBus,
    } as HookProps);
  }
}
