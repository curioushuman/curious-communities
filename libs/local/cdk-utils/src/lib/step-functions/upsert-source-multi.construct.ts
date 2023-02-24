import * as cdk from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';
import { LambdaConstruct } from '../lambda/lambda.construct';
import {
  generateCompositeResourceId,
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
  private stackId: string;
  private entityId: ResourceId;
  private lambdas: UpsertSourceMultiLambdas;
  private endStates!: Record<string, sfn.State>;
  private upsertTaskId: string;

  public upsertTasks!: Record<string, sfn.TaskStateBase>;
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
    stackId: string,
    props: UpsertSourceMultiProps
  ) {
    super(scope, stackId);

    // save some props
    this.stackId = stackId;
    this.entityId = props.entityId;
    this.lambdas = props.lambdas;

    // prepare our end states
    this.prepareEndStates();

    /**
     * Tasks for upserting a source
     */
    this.upsertTaskId = generateCompositeResourceId(
      this.stackId,
      `${this.entityId}-source-upsert`
    );
    props.sources.forEach(this.prepareUpsertSourceTask);

    /**
     * Parallel: upsert group sources
     */
    // const upsertSourcesParallelTitle = transformIdToResourceTitle(
    //   stackId,
    //   'SfnParallel'
    // );
    // const upsertSourcesParallel = new sfn.Parallel(
    //   this,
    //   upsertSourcesParallelTitle
    // );
    // upsertSourcesParallel.branch(upsertSourceCOMMUNITYTask);
    // upsertSourcesParallel.branch(upsertSourceMICROCOURSETask);

    /**
     * Task: update group
     */
    const updateResourceId = generateCompositeResourceId(
      stackId,
      `${this.entityId}-update`
    );
    const updateTaskTitle = transformIdToResourceTitle(
      updateResourceId,
      'SfnTask'
    );
    const updateTask = new tasks.LambdaInvoke(this, updateTaskTitle, {
      lambdaFunction: this.lambdas.updateDomain.lambdaFunction,
    }).addCatch(this.endStates.fail);

    /**
     * A quick pass to be able start the state machine
     */
    const startResourceId = generateCompositeResourceId(
      updateResourceId,
      'start'
    );
    const startPassTitle = transformIdToResourceTitle(
      startResourceId,
      'SfnPass'
    );
    const startPass = new sfn.Pass(this, startPassTitle);

    /**
     * Step function definition
     */
    const definition = sfn.Chain.start(startPass);

    /**
     * Add the upsertTasks to the definition
     */
    Object.keys(this.upsertTasks).forEach((key) => {
      definition.next(this.upsertTasks[key]);
    });
    // parallel version
    // const definition = sfn.Chain.start(
    //   upsertSourcesParallel
    // ).next(updateGroupTask);

    /**
     * Finish with the update task and success
     */
    definition.next(updateTask).next(this.endStates.success);

    /**
     * State machine: Upsert group source multi
     */
    const upsertSourceMultiResourceId = generateCompositeResourceId(
      stackId,
      `${this.entityId}-source-upsert-multi`
    );
    const upsertSourceMultiStateMachineTitle = transformIdToResourceTitle(
      upsertSourceMultiResourceId,
      'SfnStateMachine'
    );
    this.stateMachine = new sfn.StateMachine(
      this,
      upsertSourceMultiStateMachineTitle,
      {
        definition,
        timeout: cdk.Duration.minutes(5),
        tracingEnabled: true,
        stateMachineType: sfn.StateMachineType.EXPRESS,
      }
    );
  }

  private prepareUpsertSourceTask(source: string): void {
    const resourceId = generateCompositeResourceId(this.upsertTaskId, source);
    const taskTitle = transformIdToResourceTitle(resourceId, 'SfnTask');
    this.upsertTasks[source] = new tasks.LambdaInvoke(this, taskTitle, {
      lambdaFunction: this.lambdas.upsertSource.lambdaFunction,
      inputPath: '$.detail.responsePayload',
      payload: sfn.TaskInput.fromObject({
        token: sfn.JsonPath.taskToken,
        input: {
          source: sfn.TaskInput.fromText(source),
          // the input is from a lambda destination
          group: sfn.JsonPath.objectAt('$.group'),
        },
      }),
      // append the result to the groupSources object
      resultPath: `$.groupSources.${source}`,
    }).addCatch(this.endStates.fail);
  }
}
