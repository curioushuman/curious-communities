import * as cdk from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import { generateCompositeResourceId, resourceNameTitle } from '../utils/name';
import { ResourceId } from '../utils/name.types';
import {
  LambdaThrottledLambdas,
  LambdaThrottledProps,
} from './lambda-throttled.types';
import { StepFunctionsConstruct } from '../step-functions/step-functions.construct';
import { ChLambdaFrom } from './lambda-from.construct';
import { ChQueueFrom } from '../sqs';

/**
 * This will accept a lambda construct and throttle it using SQS. If
 * destinations are present, it will wrap the throttle lambda in a step
 * function to ensure the destination is triggered.
 *
 * NOTE: Lambda destinations won't work in SYNCHRONOUS context, only ASYNC
 * SQS and Step Machine are both SYNC. So this Step Function is to make sure
 * entity mutations are announced when throttled via SQS.
 *
 * Ref: https://repost.aws/questions/QUNhSAWNwVR2uEYDbuts9bLw/lambda-events-not-triggering-event-bridge-destination
 *
 * NOTES
 * - currently only supports EventBridge
 * - currently only supports success EventBridge events
 *
 * TODO
 * - [ ] support fail eventBridge events
 * - [ ] support other destinations as and when we need them
 */
export class LambdaThrottledConstruct extends Construct {
  private constructId: ResourceId;
  private lambdas: LambdaThrottledLambdas;
  private queue!: sqs.IQueue;

  private stepFunctionsId: ResourceId;
  private stepFunctions?: StepFunctionsConstruct;

  constructor(scope: Construct, lambdaId: string, props: LambdaThrottledProps) {
    const constructId = generateCompositeResourceId(lambdaId, 'throttled');
    super(scope, constructId);

    // save some props
    this.constructId = constructId;
    this.stepFunctionsId = generateCompositeResourceId(
      this.constructId,
      'destinations'
    );
    this.lambdas = props.lambdas;

    // prepare the lambda, or step function
    if (props.lambdas.throttled.includesDestinations()) {
      this.prepareQueueFrom();
      this.prepareStepFunctions();
    } else {
      this.prepareQueue();
      this.prepareLambda();
    }

    // allow queueing
    this.allowQueue();
  }

  /**
   * Prepares a custom queue in this stack
   */
  private prepareQueue(): void {
    const [queueName, queueTitle] = resourceNameTitle(
      this.constructId,
      'Queue'
    );
    this.queue = new sqs.Queue(this, queueTitle, {
      queueName,
      visibilityTimeout: cdk.Duration.seconds(60),
    });
  }

  /**
   * Pulls in the throttled queue from the common stack
   */
  private prepareQueueFrom(): void {
    const queueConstruct = new ChQueueFrom(this, 'cc-common-throttled');
    this.queue = queueConstruct.queue;
  }

  private allowQueue(): void {
    if (this.lambdas.queue) {
      this.queue.grantSendMessages(this.lambdas.queue.lambdaFunction);
    }
  }

  /**
   * If no destinations exist, we need do nothing more than subscribe the lambda
   */
  private prepareLambda(): void {
    this.lambdas.throttled.lambdaFunction.addEventSource(
      new SqsEventSource(this.queue, {
        batchSize: 1, // reducing to 1, as our code only deals with a single record
        maxBatchingWindow: cdk.Duration.minutes(2),
        reportBatchItemFailures: true, // default to false
      })
    );
  }

  private prepareSfnProxyLambda(): void {
    // proxy lambda can be provided, check for it first
    if (!this.lambdas.proxy) {
      // if not, use the one we prepared earlier
      this.lambdas.proxy = new ChLambdaFrom(this, 'cc-common-sqs-sfn-proxy');
    }
    // NOTE: The lambda is already subscribed to the queue
    // Allow it to execute the step functions
    if (this.stepFunctions?.stateMachine) {
      this.stepFunctions.stateMachine.grantStartExecution(
        this.lambdas.proxy.lambdaFunction
      );
    }
  }

  /**
   * If destinations exist, we need to create a step function to handle the
   * throttling and the destinations
   */
  private prepareStepFunctions(): void {
    // init the step functions construct
    // NOTE: this does nothing until you feed it tasks
    this.stepFunctions = new StepFunctionsConstruct(
      this,
      this.stepFunctionsId,
      {
        endStates: {
          fail: 'Throttled lambda failed',
          success: 'Throttled lambda succeeded',
        },
      }
    );

    const throttledTasks: Record<string, sfn.Chain> = {};

    /**
     * Task: Success destination
     *
     * NEXT: success
     * CATCH: fail
     */
    const successEventBus =
      this.lambdas.throttled.getDestinationEventBridge('onSuccess');
    if (successEventBus) {
      throttledTasks.success = new tasks.EventBridgePutEvents(
        this,
        this.stepFunctions.prepareTaskTitle('success'),
        {
          inputPath: '$.outcome.detail',
          // NOTE: we need to add this in so our other data isn't overridden?
          resultPath: '$.putEvent',
          entries: [
            {
              // NOTE: we know the output of mutate based lambdas will be CoAwsRequestPayload
              // Ref: /libs/shared/common/src/lib/infra/__types__/aws-response-payload.ts
              detail: sfn.TaskInput.fromObject({
                event: sfn.JsonPath.stringAt('$.event'),
                entity: sfn.JsonPath.stringAt('$.entity'),
                outcome: sfn.JsonPath.stringAt('$.outcome'),
                detail: sfn.JsonPath.objectAt('$.detail'),
              }),
              eventBus: successEventBus,
              detailType: 'putEvent',
              source: 'step.functions',
            },
          ],
        }
      )
        .addCatch(this.stepFunctions.endStates.fail)
        .next(this.stepFunctions.endStates.success);
    }

    /**
     * Task: throttled lambda
     *
     * NEXT: success event bus || success
     * CATCH: fail
     * TODO: CATCH: fail event bus || fail
     */
    const throttledLambdaKey = 'lambda';
    throttledTasks[throttledLambdaKey] = new tasks.LambdaInvoke(
      this,
      this.stepFunctions.prepareTaskTitle(throttledLambdaKey),
      {
        lambdaFunction: this.lambdas.throttled.lambdaFunction,
        integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
        payload: sfn.TaskInput.fromObject(sfn.JsonPath.objectAt('$.detail')),
        resultPath: '$.outcome',
        resultSelector: this.stepFunctions.prepareSfnTaskResponsePayload(
          sfn.JsonPath.objectAt('$.Payload')
        ),
      }
    )
      .addRetry(this.stepFunctions.retryProps)
      .addCatch(this.stepFunctions.endStates.fail)
      .next(throttledTasks.success || this.stepFunctions.endStates.success);

    // add the tasks to the step function
    this.stepFunctions.addSteps(throttledTasks);

    // prepare the state machine
    this.stepFunctions.prepareStateMachine(throttledLambdaKey);

    // prepare the lambda to proxy the queue to the step function
    this.prepareSfnProxyLambda();
  }
}
