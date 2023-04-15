import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';
import {
  generateCompositeResourceId,
  ResourceId,
  resourceNameTitle,
  SupportedResourceType,
  transformIdToResourceTitle,
} from '../utils';
import {
  StateMachineEndStates,
  StateMachineProps,
  StepFunctionsSupportedStep,
} from './step-functions.types';

// Cannot import from common until this is a package
// import { prepareSfnTaskResponsePayload } from '@curioushuman/common';

/**
 * ! Temporary duplication of type and function (until above is resolved)
 */
interface SfnTaskResponsePayload<T> {
  detail: T;
}

/**
 * State machine creation functions and support
 *
 * NOTES
 * - relies on your chain being built in your own task definitions
 *
 * TODO
 * - [ ] better error handling
 * - [ ] add DQL to rule
 *       https://github.com/aws-samples/serverless-patterns/blob/main/cdk-eventbridge-stepfunction-sqs/cdk/lib/eventbridge-stepfunction-sqs-stack.ts
 */
export class StepFunctionsConstruct extends Construct {
  private constructId: string;
  private steps: Record<string, StepFunctionsSupportedStep> = {};
  private definition?: sfn.Chain;
  private logGroup!: logs.ILogGroup;

  public endStates!: Record<string, sfn.State>;
  public stateMachine?: sfn.StateMachine;
  public retryProps: sfn.RetryProps = {
    interval: cdk.Duration.seconds(2),
    maxAttempts: 3,
  };

  constructor(scope: Construct, constructId: string, props: StateMachineProps) {
    super(scope, constructId);

    // save some props
    this.constructId = constructId;

    // prepare our end states
    this.prepareEndStates(props.endStates);

    // prepare our log group
    this.prepareLogGroup();
  }

  private prepareLogGroup(): void {
    const [logGroupName, logGroupTitle] = resourceNameTitle(
      this.constructId,
      'LogGroup'
    );
    this.logGroup = new logs.LogGroup(this, logGroupTitle, {
      logGroupName: logGroupName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_MONTH,
    });
  }

  private prepareEndStates(endStates?: StateMachineEndStates): void {
    let success = endStates?.success;
    if (success === undefined) {
      success = new sfn.Succeed(this, 'State machine succeeded');
    }
    if (typeof success === 'string') {
      success = new sfn.Succeed(this, success);
    }
    let fail = endStates?.fail;
    if (fail === undefined) {
      fail = new sfn.Fail(this, 'State machine failed');
    }
    if (typeof fail === 'string') {
      fail = new sfn.Fail(this, fail);
    }
    this.endStates = {
      fail,
      success,
    };
  }

  public addSteps(steps: Record<string, StepFunctionsSupportedStep>): void {
    this.steps = {
      ...this.steps,
      ...steps,
    };
  }

  public prepareStateMachine(firstTaskId: string): sfn.StateMachine {
    if (Object.keys(this.steps).length === 0 || !this.steps[firstTaskId]) {
      throw new Error('Missing steps');
    }
    // add the first task, everything else is pre-chained
    this.definition = sfn.Chain.start(this.steps[firstTaskId]);

    // create our state machine
    const [stateMachineName, stateMachineTitle] = resourceNameTitle(
      this.constructId,
      'SfnStateMachine'
    );
    this.stateMachine = new sfn.StateMachine(this, stateMachineTitle, {
      stateMachineName: stateMachineName,
      definition: this.definition,
      timeout: cdk.Duration.minutes(5),
      tracingEnabled: true,
      stateMachineType: sfn.StateMachineType.EXPRESS,
      logs: {
        destination: this.logGroup,
        level: sfn.LogLevel.ALL,
      },
    });
    return this.stateMachine;
  }

  private prepareStepTitle(
    stepId: ResourceId,
    resourceType: SupportedResourceType
  ): string {
    // this will throw an error if the stepId is not valid
    ResourceId.check(stepId);
    const resourceId = generateCompositeResourceId(this.constructId, stepId);
    const stepTitle = transformIdToResourceTitle(resourceId, resourceType);
    return stepTitle;
  }

  public prepareChoiceTitle(choiceId: ResourceId): string {
    return this.prepareStepTitle(choiceId, 'SfnChoice');
  }

  public prepareTaskTitle(taskId: ResourceId): string {
    return this.prepareStepTitle(taskId, 'SfnTask');
  }

  public preparePassTitle(passId: ResourceId): string {
    return this.prepareStepTitle(passId, 'SfnPass');
  }

  public prepareSfnTaskResponsePayload<T>(
    payload: T
  ): SfnTaskResponsePayload<T> {
    return { detail: payload };
  }
}
