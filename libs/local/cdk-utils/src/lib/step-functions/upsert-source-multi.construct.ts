import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { LambdaConstruct } from '../lambda/lambda.construct';
import {
  generateCompositeResourceId,
  resourceNameTitle,
  transformIdToResourceTitle,
} from '../utils/name';
import { ResourceId } from '../utils/name.types';

/**
 * Props required
 */
interface UpsertSourceMultiLambdas {
  upsertSource: LambdaConstruct;
  updateDomain: LambdaConstruct;
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
  private entityId: ResourceId;
  private lambdas: UpsertSourceMultiLambdas;
  private endStates!: Record<string, sfn.State>;
  private upsertTaskId: string;
  private firstTaskKey!: string;
  private lastTaskKey!: string;

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
    this.entityId = props.entityId;
    this.lambdas = props.lambdas;

    // prepare our end states
    this.prepareEndStates();

    /**
     * Tasks for upserting a source
     */
    this.upsertTaskId = generateCompositeResourceId(
      constructId,
      `${this.entityId}-source-upsert`
    );
    // doing it this way makes it anonymous, and detaches it from this
    // props.sources.forEach(this.prepareUpsertSourceTask);
    // this way retains state
    props.sources.forEach((source) => this.prepareUpsertSourceTask(source));

    /**
     * Parallel: upsert sources
     */
    // const upsertSourcesParallelTitle = transformIdToResourceTitle(
    //   constructId,
    //   'SfnParallel'
    // );
    // const upsertSourcesParallel = new sfn.Parallel(
    //   this,
    //   upsertSourcesParallelTitle
    // );
    // upsertSourcesParallel.branch(upsertSourceCOMMUNITYTask);
    // upsertSourcesParallel.branch(upsertSourceMICROCOURSETask);
    // const definition = sfn.Chain.start(
    //   upsertSourcesParallel
    // ).next(updateDomainTask);

    /**
     * Task: update domain
     *
     * NOTE: this will move on to end state
     */
    const updateResourceId = generateCompositeResourceId(
      constructId,
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
    payloadObject[this.entityId] = sfn.JsonPath.objectAt(
      '$.detail.responsePayload.detail'
    );
    const updateTask = new tasks.LambdaInvoke(this, updateTaskTitle, {
      lambdaFunction: this.lambdas.updateDomain.lambdaFunction,
      integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
      payload: sfn.TaskInput.fromObject(payloadObject),
    })
      .addCatch(this.endStates.fail)
      .next(this.endStates.success);

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
     * Connect the last task to the update task
     */
    this.upsertTasks[this.lastTaskKey].next(updateTask);

    /**
     * Step function definition; start it with the first task
     * The rest have been pre-chained
     */
    const definition = sfn.Chain.start(this.upsertTasks[this.firstTaskKey]);

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

  private prepareUpsertSourceTask(source: string): void {
    if (!this.firstTaskKey) {
      this.firstTaskKey = source;
    }
    this.lastTaskKey = source;
    const resourceId = generateCompositeResourceId(this.upsertTaskId, source);
    const taskTitle = transformIdToResourceTitle(resourceId, 'SfnTask');

    // input allows us to shape the data that is passed into our task/lambda
    const payloadObject: Record<string, unknown> = {
      source: sfn.TaskInput.fromText(source),
    };
    payloadObject[this.entityId] = sfn.JsonPath.objectAt('$.detail');

    // resultSelector allows us to shape the data that is returned from our task/lambda
    const resultSelector: Record<string, unknown> = {
      detail: sfn.JsonPath.objectAt('$.Payload'),
    };

    this.upsertTasks[source] = new tasks.LambdaInvoke(this, taskTitle, {
      lambdaFunction: this.lambdas.upsertSource.lambdaFunction,
      integrationPattern: sfn.IntegrationPattern.REQUEST_RESPONSE,
      inputPath: '$.detail.responsePayload',
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
