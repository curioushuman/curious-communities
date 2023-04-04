import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { LambdaConstruct } from '../lambda/lambda.construct';
import {
  generateCompositeResourceId,
  resourceNameTitle,
  transformIdToKey,
  transformIdToResourceTitle,
} from '../utils/name';
import { ResourceId } from '../utils/name.types';

/**
 * Props required
 */
interface UpsertSourceMultiLambdas {
  upsertSource: LambdaConstruct;
  // For GroupMembers (and maybe others) there is no need for a post upsert update
  // We still want to make sure most instances DO specify an update task
  // By forcing GroupMembers to specify `undefined` we can ensure that
  updateDomain: LambdaConstruct | undefined;
}
export interface UpsertSourceMultiProps {
  lambdas: UpsertSourceMultiLambdas;
  entityId: ResourceId;
  sources: string[];
}

/**
 * Step functions definition to upsert sources and save the IDs to domain
 *
 * TODO
 * - [ ] use Source from the relevant service e.g. cc-groups-service
 * - [ ] see if you can run the upsertSource tasks in parallel
 *       code is commented out below
 * - [ ] add DQL to rule
 *       https://github.com/aws-samples/serverless-patterns/blob/main/cdk-eventbridge-stepfunction-sqs/cdk/lib/eventbridge-stepfunction-sqs-stack.ts
 */
export class UpsertSourceMultiConstruct extends Construct {
  private constructId: ResourceId;
  private entityId: ResourceId;
  private entityKey: string;
  private lambdas: UpsertSourceMultiLambdas;
  private endStates!: Record<string, sfn.State>;
  private upsertTaskId: string;
  private firstTaskKey!: string;
  private lastTaskKey!: string;

  public checkInput!: sfn.Choice;
  public updateTask!: sfn.Chain;
  public upsertTasks: Record<string, sfn.TaskStateBase> = {};
  public stateMachine: sfn.StateMachine;

  private prepareEndStates(): void {
    // Our two end states
    const fail = new sfn.Fail(
      this,
      `${this.entityId}-source multi upsert failed`,
      {}
    );
    const success = new sfn.Succeed(
      this,
      `${this.entityId}-source multi upsert succeeded`
    );
    this.endStates = {
      fail,
      success,
    };
  }

  constructor(
    scope: Construct,
    constructId: string,
    props: UpsertSourceMultiProps
  ) {
    super(scope, constructId);

    // save some props
    this.constructId = constructId;
    this.entityId = props.entityId;
    this.entityKey = transformIdToKey(this.entityId);
    this.lambdas = props.lambdas;

    // prepare our end states
    this.prepareEndStates();

    /**
     * Create tasks for upserting a source
     */
    this.upsertTaskId = generateCompositeResourceId(
      constructId,
      `${this.entityId}-source-upsert`
    );
    props.sources.forEach((source) => this.prepareUpsertSourceTask(source));

    /**
     * Prepare the upsert tasks, chain them together with next()
     */
    let previousTask: sfn.TaskStateBase;
    Object.keys(this.upsertTasks).forEach((key) => {
      if (previousTask) {
        previousTask.next(this.upsertTasks[key]);
      }
      previousTask = this.upsertTasks[key];
    });

    /**
     * Prepare the update task
     *
     * NOTE: must be done AFTER the upsert tasks have been prepared
     */
    this.prepareUpdateTask();

    /**
     * Prepare the input check step
     *
     * NOTE: must be done AFTER the upsert tasks have been prepared
     */
    this.prepareCheckInput();

    /**
     * Step function definition; start it with the input check
     * The rest have been pre-chained
     */
    const definition = sfn.Chain.start(this.checkInput);

    /**
     * Log group for state machine
     */
    const [upsertSourceMultiLogGroupName, upsertSourceMultiLogGroupTitle] =
      resourceNameTitle(constructId, 'LogGroup');
    const logGroup = new logs.LogGroup(this, upsertSourceMultiLogGroupTitle, {
      logGroupName: upsertSourceMultiLogGroupName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_MONTH,
    });

    /**
     * State machine
     */
    const [
      upsertSourceMultiStateMachineName,
      upsertSourceMultiStateMachineTitle,
    ] = resourceNameTitle(constructId, 'SfnStateMachine');
    this.stateMachine = new sfn.StateMachine(
      this,
      upsertSourceMultiStateMachineTitle,
      {
        stateMachineName: upsertSourceMultiStateMachineName,
        definition,
        timeout: cdk.Duration.minutes(5),
        tracingEnabled: true,
        stateMachineType: sfn.StateMachineType.EXPRESS,
        logs: {
          destination: logGroup,
          level: sfn.LogLevel.ALL,
        },
      }
    );
  }

  /**
   * Prepares an optional update task
   *
   * NOTE: most entities will have an update task
   *       it is used to capture the source Ids against the domain entity
   *       but some (e.g. GroupMembers) will not require this, as no source Id exists
   */
  private prepareUpdateTask(): void {
    if (this.lambdas.updateDomain === undefined) {
      return;
    }
    const updateResourceId = generateCompositeResourceId(
      this.constructId,
      `${this.entityId}-update`
    );
    const updateTaskTitle = transformIdToResourceTitle(
      updateResourceId,
      'SfnTask'
    );
    // first we'll set up the input structure
    const payloadObject: Record<string, unknown> = {
      sources: sfn.JsonPath.objectAt(`$.sources`),
    };
    payloadObject[this.entityKey] = sfn.JsonPath.objectAt('$.detail');
    this.updateTask = new tasks.LambdaInvoke(this, updateTaskTitle, {
      lambdaFunction: this.lambdas.updateDomain.lambdaFunction,
      integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
      payload: sfn.TaskInput.fromObject(payloadObject),
    })
      .addCatch(this.endStates.fail)
      .next(this.endStates.success);

    /**
     * Connect the last task to the update task
     * The update task then goes to the success state
     */
    this.upsertTasks[this.lastTaskKey].next(this.updateTask);
  }

  /**
   * NOTE: similar function exists in:
   * /apps/education/courses/src/infra/upsert-participant/construct.ts
   */
  private preparePassTitle(taskId: ResourceId): string {
    // this will throw an error if the taskId is not valid
    ResourceId.check(taskId);
    const resourceId = generateCompositeResourceId(this.constructId, taskId);
    const taskTitle = transformIdToResourceTitle(resourceId, 'SfnPass');
    return taskTitle;
  }

  private prepareCheckInput(): void {
    // We don't give the pass a resultPath
    // which means it will overwrite the entire input
    // with it's outputPath
    const convertResponsePayload = new sfn.Pass(
      this,
      this.preparePassTitle('convert-input-response-payload'),
      {
        outputPath: '$.detail.responsePayload',
      }
    ).next(this.upsertTasks[this.firstTaskKey]);
    const convertDetail = new sfn.Pass(
      this,
      this.preparePassTitle('convert-input-detail'),
      {
        outputPath: '$.detail',
      }
    ).next(this.upsertTasks[this.firstTaskKey]);

    const choiceTitle = transformIdToResourceTitle(
      this.constructId,
      'SfnChoice'
    );
    this.checkInput = new sfn.Choice(this, choiceTitle)
      .when(
        sfn.Condition.isPresent('$.detail.responsePayload'),
        convertResponsePayload
      )
      .otherwise(convertDetail);
  }

  private prepareUpsertSourceTask(source: string): void {
    // record the first and last task keys
    if (!this.firstTaskKey) {
      this.firstTaskKey = source;
    }
    this.lastTaskKey = source;

    // generate the task id and title
    const resourceId = generateCompositeResourceId(this.upsertTaskId, source);
    const taskTitle = transformIdToResourceTitle(resourceId, 'SfnTask');

    // this allows us to shape the data that is passed into our task/lambda
    const payloadObject: Record<string, unknown> = {
      source: sfn.TaskInput.fromText(source),
    };
    payloadObject[this.entityKey] = sfn.JsonPath.objectAt('$.detail');

    // resultSelector allows us to shape the data that is returned from our task/lambda
    const resultSelector: Record<string, unknown> = {
      detail: sfn.JsonPath.objectAt('$.Payload'),
    };

    this.upsertTasks[source] = new tasks.LambdaInvoke(this, taskTitle, {
      lambdaFunction: this.lambdas.upsertSource.lambdaFunction,
      integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
      payload: sfn.TaskInput.fromObject(payloadObject),
      // append the result to the sources object
      resultPath: `$.sources.${source}`,
      resultSelector,
    })
      .addCatch(this.endStates.fail)
      .addRetry({
        interval: cdk.Duration.seconds(2),
        maxAttempts: 3,
      });
  }
}
