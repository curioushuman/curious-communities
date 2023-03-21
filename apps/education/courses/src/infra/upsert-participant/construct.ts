import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLambdaFrom,
  generateCompositeResourceId,
  LambdaConstruct,
  ResourceId,
  resourceNameTitle,
  transformIdToResourceTitle,
} from '../../../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

// Above limitation also prevents us from using the following:
// import { prepareSfnTaskResponsePayload } from '@curioushuman/common';

/**
 * ! Temporary duplication of type and function (until above is resolved)
 */
interface SfnTaskResponsePayload<T> {
  detail: T;
}
function prepareSfnTaskResponsePayload<T>(
  payload: T
): SfnTaskResponsePayload<T> {
  return { detail: payload };
}

/**
 * Props required
 */
interface UpsertParticipantLambdas {
  findCourse: LambdaConstruct;
  findParticipant: LambdaConstruct;
  findParticipantSource: LambdaConstruct;
  createParticipant: LambdaConstruct;
  updateParticipant: LambdaConstruct;
}
export interface UpsertParticipantProps {
  lambdas: UpsertParticipantLambdas;
  eventBus: events.IEventBus;
}

/**
 * Step functions definition to create a participant
 *
 * TODO
 * - [ ] better error handling
 * - [ ] when coming from upsertParticipantMulti, deal with participantSource as input
 *       rather than, currently, using idSource to re-request the participantSource
 * - [ ] add DQL to rule
 *       https://github.com/aws-samples/serverless-patterns/blob/main/cdk-eventbridge-stepfunction-sqs/cdk/lib/eventbridge-stepfunction-sqs-stack.ts
 */
export class UpsertParticipantConstruct extends Construct {
  private constructId: string;
  private lambdas: UpsertParticipantLambdas;
  private eventBus: events.IEventBus;
  private externalFunctions: Record<string, lambda.IFunction> = {};
  private endStates!: Record<string, sfn.State>;
  private retryProps: sfn.RetryProps = {
    interval: cdk.Duration.seconds(2),
    maxAttempts: 3,
  };

  public tasks: Record<string, sfn.Chain> = {};
  public definition: sfn.Chain;
  public logGroup!: logs.ILogGroup;
  public stateMachine: sfn.StateMachine;

  constructor(
    scope: Construct,
    constructId: string,
    props: UpsertParticipantProps
  ) {
    super(scope, constructId);

    // save some props
    this.constructId = constructId;
    this.lambdas = props.lambdas;
    this.eventBus = props.eventBus;

    // prepare our end states
    this.prepareEndStates();

    // prepare other required external functions
    this.prepareExternalFunctions();

    // prepare our tasks
    this.prepareTasks();

    // prepare our log group
    this.prepareLogGroup();

    // prepare our definition
    // add the first task, everything else is pre-chained
    this.definition = sfn.Chain.start(this.tasks.findParticipant);

    // create our state machine
    const [stateMachineName, stateMachineTitle] = resourceNameTitle(
      constructId,
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

  private prepareEndStates(): void {
    // Our two end states
    const fail = new sfn.Fail(this, `Participant upsert failed`, {});
    const success = new sfn.Succeed(this, `Participant upsert succeeded`);
    this.endStates = {
      fail,
      success,
    };
  }

  private prepareExternalFunction(functionId: string): lambda.IFunction {
    const lambdaFrom = new ChLambdaFrom(this, functionId);
    return lambdaFrom.lambdaFunction;
  }

  private prepareExternalFunctions(): void {
    const functionIds: Record<string, string> = {
      findMember: 'cc-members-member-find',
      createMember: 'cc-members-member-create',
    };
    for (const [key, value] of Object.entries(functionIds)) {
      this.externalFunctions[key] = this.prepareExternalFunction(value);
    }
  }

  private prepareTaskTitle(taskId: ResourceId): string {
    // this will throw an error if the taskId is not valid
    ResourceId.check(taskId);
    const resourceId = generateCompositeResourceId(this.constructId, taskId);
    const taskTitle = transformIdToResourceTitle(resourceId, 'SfnTask');
    return taskTitle;
  }

  /**
   * NOTE: similar function exists in:
   * /libs/local/cdk-utils/src/lib/step-functions/upsert-source-multi.construct.ts
   */
  private preparePassTitle(taskId: ResourceId): string {
    // this will throw an error if the taskId is not valid
    ResourceId.check(taskId);
    const resourceId = generateCompositeResourceId(this.constructId, taskId);
    const taskTitle = transformIdToResourceTitle(resourceId, 'SfnPass');
    return taskTitle;
  }

  private prepareTasks(): void {
    /**
     * Task: Announce participant update
     *
     * NEXT: success
     * CATCH: fail
     */
    this.tasks.putEventParticipantUpserted = new tasks.EventBridgePutEvents(
      this,
      this.prepareTaskTitle('participant-upsert-put-event'),
      {
        inputPath: '$.participant.detail',
        // NOTE: we need to add this in so our other data isn't overridden?
        resultPath: '$.participant.putEvent',
        entries: [
          {
            // NOTE: we know the output of updateParticipant will be CoAwsRequestPayload
            // Ref: /libs/shared/common/src/lib/infra/__types__/aws-response-payload.ts
            detail: sfn.TaskInput.fromObject({
              event: sfn.JsonPath.stringAt('$.event'),
              entity: sfn.JsonPath.stringAt('$.entity'),
              outcome: sfn.JsonPath.stringAt('$.outcome'),
              detail: sfn.JsonPath.objectAt('$.detail'),
            }),
            eventBus: this.eventBus,
            detailType: 'putEvent',
            source: 'step.functions',
          },
        ],
      }
    )
      .addCatch(this.endStates.fail)
      .next(this.endStates.success);

    /**
     * Task: update participant
     *
     * If the participant already exists, then we take the short route
     *
     * NEXT: putEventParticipantUpserted
     * CATCH: fail
     */
    this.tasks.updateParticipant = new tasks.LambdaInvoke(
      this,
      this.prepareTaskTitle('participant-update'),
      {
        lambdaFunction: this.lambdas.updateParticipant.lambdaFunction,
        integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
        inputPath: '$.detail',
        payload: sfn.TaskInput.fromObject({
          idSourceValue: sfn.JsonPath.stringAt('$.participantIdSourceValue'),
        }),
        resultPath: '$.participant',
        resultSelector: prepareSfnTaskResponsePayload(
          sfn.JsonPath.objectAt('$.Payload')
        ),
      }
    )
      .addCatch(this.endStates.fail)
      .next(this.tasks.putEventParticipantUpserted);

    /**
     * Task: create participant
     *
     * NEXT: putEventParticipantUpserted
     * CATCH: fail
     */
    this.tasks.createParticipant = new tasks.LambdaInvoke(
      this,
      this.prepareTaskTitle('participant-create'),
      {
        lambdaFunction: this.lambdas.createParticipant.lambdaFunction,
        integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
        resultPath: '$.participant',
        resultSelector: prepareSfnTaskResponsePayload(
          sfn.JsonPath.objectAt('$.Payload')
        ),
      }
    )
      .addCatch(this.endStates.fail)
      .next(this.tasks.putEventParticipantUpserted);

    /**
     * Task: PAUSE after member creation
     *
     * NOTE: This is to allow for upsertMemberSource to occur. See related issue.
     * Ref: https://github.com/curioushuman/curious-communities/issues/9
     *
     * NEXT: createParticipant
     */
    this.tasks.postMemberCreatePause = new sfn.Wait(
      this,
      this.prepareTaskTitle('member-create-pause'),
      {
        time: sfn.WaitTime.duration(cdk.Duration.seconds(10)),
      }
    ).next(this.tasks.createParticipant);

    /**
     * Task: Announce member creation
     *
     * NEXT: createParticipant
     * CATCH: fail
     */
    this.tasks.putEventMemberCreated = new tasks.EventBridgePutEvents(
      this,
      this.prepareTaskTitle('member-create-put-event'),
      {
        inputPath: '$.member.detail',
        // NOTE: we need to add this in so our other data isn't overridden?
        resultPath: '$.member.putEvent',
        entries: [
          {
            // NOTE: we know the output of createMember will be CoAwsRequestPayload
            // Ref: /libs/shared/common/src/lib/infra/__types__/aws-response-payload.ts
            detail: sfn.TaskInput.fromObject({
              event: sfn.JsonPath.stringAt('$.event'),
              entity: sfn.JsonPath.stringAt('$.entity'),
              outcome: sfn.JsonPath.stringAt('$.outcome'),
              detail: sfn.JsonPath.objectAt('$.detail'),
            }),
            eventBus: this.eventBus,
            detailType: 'putEvent',
            source: 'step.functions',
          },
        ],
      }
    )
      .addCatch(this.endStates.fail)
      .next(this.tasks.postMemberCreatePause);

    /**
     * Task: create member
     *
     * If the member does not exist, create it
     *
     * NEXT: putEventMemberCreated
     * CATCH: fail
     */
    this.tasks.createMember = new tasks.LambdaInvoke(
      this,
      this.prepareTaskTitle('member-create'),
      {
        lambdaFunction: this.externalFunctions.createMember,
        integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
        payload: sfn.TaskInput.fromObject({
          participantSource: sfn.JsonPath.objectAt('$.participantSource'),
        }),
        resultPath: '$.member',
        resultSelector: prepareSfnTaskResponsePayload(
          sfn.JsonPath.objectAt('$.Payload')
        ),
      }
    )
      .addCatch(this.endStates.fail)
      .next(this.tasks.putEventMemberCreated);

    /**
     * Task: find member
     *
     * NEXT: createParticipant
     * CATCH: createMember
     */
    this.tasks.findMember = new tasks.LambdaInvoke(
      this,
      this.prepareTaskTitle('member-find'),
      {
        lambdaFunction: this.externalFunctions.findMember,
        integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
        payload: sfn.TaskInput.fromObject({
          participantSource: sfn.JsonPath.objectAt('$.participantSource'),
        }),
        resultPath: '$.member',
        resultSelector: prepareSfnTaskResponsePayload(
          sfn.JsonPath.objectAt('$.Payload')
        ),
      }
    )
      // this catches the specific NotFound error, and passes through to create
      .addCatch(
        new sfn.Pass(this, this.preparePassTitle('member-find')).next(
          this.tasks.createMember
        ),
        {
          errors: ['RepositoryItemNotFoundError'],
          // must include this, otherwise error result overrides full result
          resultPath: '$.errors.memberFind',
        }
      )
      // will hand off any other error to the fail state
      .addCatch(this.endStates.fail)
      .next(this.tasks.createParticipant);

    /**
     * Task: find course
     *
     * NEXT: findMember
     * CATCH: fail
     */
    this.tasks.findCourse = new tasks.LambdaInvoke(
      this,
      this.prepareTaskTitle('course-find'),
      {
        lambdaFunction: this.lambdas.findCourse.lambdaFunction,
        integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
        payload: sfn.TaskInput.fromObject({
          participantSource: sfn.JsonPath.objectAt('$.participantSource'),
        }),
        resultPath: '$.course',
        resultSelector: prepareSfnTaskResponsePayload(
          sfn.JsonPath.objectAt('$.Payload')
        ),
      }
    )
      .addCatch(this.endStates.fail)
      .next(this.tasks.findMember);

    /**
     * Task: find participant source
     *
     * NEXT: findCourse
     * CATCH: fail
     */
    this.tasks.findParticipantSource = new tasks.LambdaInvoke(
      this,
      this.prepareTaskTitle('participant-source-find'),
      {
        lambdaFunction: this.lambdas.findParticipantSource.lambdaFunction,
        integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
        inputPath: '$.detail',
        payload: sfn.TaskInput.fromObject({
          idSourceValue: sfn.JsonPath.stringAt('$.participantIdSourceValue'),
        }),
        resultPath: '$.participantSource',
        resultSelector: prepareSfnTaskResponsePayload(
          sfn.JsonPath.objectAt('$.Payload')
        ),
      }
    )
      .addRetry(this.retryProps)
      .addCatch(this.endStates.fail)
      .next(this.tasks.findCourse);

    /**
     * Task: find participant
     *
     * NEXT: updateParticipant
     * CATCH: findParticipantSource
     */
    this.tasks.findParticipant = new tasks.LambdaInvoke(
      this,
      this.prepareTaskTitle('participant-find'),
      {
        lambdaFunction: this.lambdas.findParticipant.lambdaFunction,
        integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
        inputPath: '$.detail',
        payload: sfn.TaskInput.fromObject({
          idSourceValue: sfn.JsonPath.stringAt('$.participantIdSourceValue'),
        }),
        resultPath: '$.participant',
        resultSelector: prepareSfnTaskResponsePayload(
          sfn.JsonPath.objectAt('$.Payload')
        ),
      }
    )
      // this catches the specific NotFound error, and passes through to create
      .addCatch(
        new sfn.Pass(this, this.preparePassTitle('participant-find')).next(
          this.tasks.findParticipantSource
        ),
        {
          errors: ['RepositoryItemNotFoundError'],
          // must include this, otherwise error result overrides full result
          resultPath: '$.errors.participantFind',
        }
      )
      // will hand off any other error to the fail state
      .addCatch(this.endStates.fail)
      .next(this.tasks.updateParticipant);
  }
}
