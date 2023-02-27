import * as cdk from 'aws-cdk-lib';
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
}

/**
 * Step functions definition to create a participant
 *
 * TODO
 * - [ ] better error handling
 * - [ ] add DQL to rule
 *       https://github.com/aws-samples/serverless-patterns/blob/main/cdk-eventbridge-stepfunction-sqs/cdk/lib/eventbridge-stepfunction-sqs-stack.ts
 */
export class UpsertParticipantConstruct extends Construct {
  private constructId: string;
  private lambdas: UpsertParticipantLambdas;
  private externalFunctions: Record<string, lambda.IFunction> = {};
  private endStates!: Record<string, sfn.State>;

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

    // prepare our end states
    this.prepareEndStates();

    // prepare other required external functions
    this.prepareExternalFunctions();

    // prepare our tasks
    this.prepareTasks();

    // prepare our log group
    this.prepareLogGroup();

    // prepare our definition
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

  private prepareExternalFunctions(): void {
    const functionIds: Record<string, string> = {
      findMember: 'cc-members-member-find',
      createMember: 'cc-members-member-create',
    };
    for (const [key, value] of Object.entries(functionIds)) {
      this.externalFunctions[key] = this.prepareExternalFunction(value);
    }
  }

  private prepareExternalFunction(functionId: string): lambda.IFunction {
    const lambdaFrom = new ChLambdaFrom(this, functionId);
    return lambdaFrom.lambdaFunction;
  }

  private prepareTaskTitle(taskId: ResourceId): string {
    // this will throw an error if the taskId is not valid
    ResourceId.check(taskId);
    const resourceId = generateCompositeResourceId(this.constructId, taskId);
    const taskTitle = transformIdToResourceTitle(resourceId, 'SfnTask');
    return taskTitle;
  }

  private preparePassTitle(taskId: ResourceId): string {
    // this will throw an error if the taskId is not valid
    ResourceId.check(taskId);
    const resourceId = generateCompositeResourceId(this.constructId, taskId);
    const taskTitle = transformIdToResourceTitle(resourceId, 'SfnPass');
    return taskTitle;
  }

  private prepareTasks(): void {
    /**
     * Task: update participant
     *
     * If the participant already exists, then we take the short route
     *
     * NEXT: success
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
          participantIdSourceValue: sfn.JsonPath.stringAt(
            '$.participantIdSourceValue'
          ),
        }),
        resultPath: '$.participant',
        resultSelector: {
          detail: sfn.JsonPath.objectAt('$.Payload'),
        },
      }
    )
      .addCatch(this.endStates.fail)
      .next(this.endStates.success);

    /**
     * Task: create participant
     *
     * NEXT: success
     * CATCH: fail
     */
    this.tasks.createParticipant = new tasks.LambdaInvoke(
      this,
      this.prepareTaskTitle('participant-create'),
      {
        lambdaFunction: this.lambdas.createParticipant.lambdaFunction,
        integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
        resultPath: '$.participant',
        resultSelector: {
          detail: sfn.JsonPath.objectAt('$.Payload'),
        },
      }
    )
      .addCatch(this.endStates.fail)
      .next(this.endStates.success);

    /**
     * Task: create member
     *
     * If the member does not exist, create it
     *
     * NEXT: createParticipant
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
        resultSelector: {
          detail: sfn.JsonPath.objectAt('$.Payload'),
        },
      }
    )
      .addCatch(this.endStates.fail)
      .next(this.tasks.createParticipant);

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
        resultSelector: {
          detail: sfn.JsonPath.objectAt('$.Payload'),
        },
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
        resultSelector: {
          detail: sfn.JsonPath.objectAt('$.Payload'),
        },
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
          participantIdSourceValue: sfn.JsonPath.stringAt(
            '$.participantIdSourceValue'
          ),
        }),
        resultPath: '$.participantSource',
        resultSelector: {
          detail: sfn.JsonPath.objectAt('$.Payload'),
        },
      }
    )
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
          participantIdSourceValue: sfn.JsonPath.stringAt(
            '$.participantIdSourceValue'
          ),
        }),
        resultPath: '$.participant',
        resultSelector: {
          detail: sfn.JsonPath.objectAt('$.Payload'),
        },
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
