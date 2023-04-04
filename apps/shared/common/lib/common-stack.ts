import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  generateCompositeResourceId,
  LambdaConstruct,
  resourceNameTitle,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
import { CcCommonEvents } from '../src/utils/events/construct';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

export class CcCommonStack extends cdk.Stack {
  constructor(scope: cdk.App, stackId: string, props?: cdk.StackProps) {
    super(scope, stackId, props);

    /**
     * Shared event buses
     */
    const eventsId = generateCompositeResourceId(stackId, 'events');
    const events = new CcCommonEvents(this, eventsId);

    /**
     * SQS to SFN proxy lambda and co
     */
    const sqsSfnProxyId = generateCompositeResourceId(stackId, 'sqs-sfn-proxy');
    const sqsSfnThrottledId = generateCompositeResourceId(stackId, 'throttled');

    /**
     * Allowing the lambda to execute any state machine
     *
     * TODO: lock this down more
     */
    const [sqsSfnRoleName, sqsSfnRoleTitle] = resourceNameTitle(
      sqsSfnProxyId,
      'Role'
    );
    const sqsSfnProxyRole = new iam.Role(this, sqsSfnRoleTitle, {
      roleName: sqsSfnRoleName,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    sqsSfnProxyRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaBasicExecutionRole'
      )
    );
    sqsSfnProxyRole.addToPolicy(
      new iam.PolicyStatement({
        resources: ['*'],
        actions: [
          'states:StartExecution',
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
      })
    );

    /**
     * Function
     */
    const sqsSfnProxyLambdaConstruct = new LambdaConstruct(
      this,
      sqsSfnProxyId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/utils/sqs-sfn-proxy/main.ts'
        ),
        lambdaProps: {
          role: sqsSfnProxyRole,
        },
      }
    );

    /**
     * Throttling queue
     */
    const [sqsSfnQueueName, sqsSfnQueueTitle] = resourceNameTitle(
      sqsSfnThrottledId,
      'Queue'
    );
    const sqsSfnQueue = new sqs.Queue(this, sqsSfnQueueTitle, {
      queueName: sqsSfnQueueName,
      visibilityTimeout: cdk.Duration.seconds(60),
    });

    // Subscribe the function, to the queue
    sqsSfnProxyLambdaConstruct.lambdaFunction.addEventSource(
      new SqsEventSource(sqsSfnQueue, {
        batchSize: 3, // default
        maxBatchingWindow: cdk.Duration.minutes(2),
        reportBatchItemFailures: true, // default to false
      })
    );
  }
}
