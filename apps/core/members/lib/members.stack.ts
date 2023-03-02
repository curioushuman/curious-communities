import * as cdk from 'aws-cdk-lib';
import * as destinations from 'aws-cdk-lib/aws-lambda-destinations';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLayerFrom,
  LambdaEventSubscription,
  ChEventBusFrom,
  LambdaConstruct,
  generateCompositeResourceId,
  resourceNameTitle,
  UpsertSourceMultiConstruct,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import { MembersDynamoDbConstruct } from '../src/adapter/implementations/dynamodb/members-dynamodb.construct';

/**
 * These are the components required for the members stack
 */
export class MembersStack extends cdk.Stack {
  private lambdaProps: NodejsFunctionProps = {
    bundling: {
      externalModules: ['@curioushuman/cc-members-service'],
    },
    layers: [] as lambda.ILayerVersion[],
  };

  constructor(scope: cdk.App, stackId: string, props?: cdk.StackProps) {
    super(scope, stackId, props);

    /**
     * Other AWS services this stack needs pay attention to
     */

    /**
     * Members table
     *
     * NOTES
     * - this has been abstracted into a construct just to keep this file tidy
     * - all LSI and GSI details can be found in the construct
     */
    const membersTableConstruct = new MembersDynamoDbConstruct(this, stackId);

    /**
     * External events eventBus
     */
    const externalEventBusConstruct = new ChEventBusFrom(
      this,
      'cc-events-external'
    );

    /**
     * Internal events eventBus
     */
    const internalEventBusConstruct = new ChEventBusFrom(
      this,
      'cc-events-internal'
    );

    /**
     * Eventbridge destination for our lambdas
     *
     * Resulting event should look something like:
     *
     * {
     *   "DetailType":"Lambda Function Invocation Result - Success",
     *   "Source": "lambda",
     *   "EventBusName": "{eventBusArn}",
     *   "Detail": {
     *     ...Member
     *   }
     * }
     *
     * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_destinations-readme.html#destination-specific-json-format
     */
    const onLambdaSuccess = new destinations.EventBridgeDestination(
      internalEventBusConstruct.eventBus
    );
    // use this for any lambda that needs to send events to the internal event bus
    const lambdaPropsWithDestination: NodejsFunctionProps = {
      ...this.lambdaProps,
      onSuccess: onLambdaSuccess,
    };

    /**
     * Required layers, additional to normal defaults
     */
    const chLayerMembers = new ChLayerFrom(this, 'cc-members-service');
    this.lambdaProps.layers?.push(chLayerMembers.layer);

    /**
     * Stack env vars
     */
    const requiredEnvVars = ['MEMBERS_DEFAULT_PASSWORD'];

    /**
     * Functions
     */

    /**
     * Function: Create Member
     *
     * Triggers
     * - Subscribed to external event bus
     * - create participant step functions
     *
     * NOTE: destination is not invoked when called within step functions
     */
    const createMemberLambdaConstruct = new LambdaEventSubscription(
      this,
      generateCompositeResourceId(stackId, 'member-create'),
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/create-member/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetailType: 'putEvent',
        ruleDetails: {
          object: ['member'],
          type: ['created'],
        },
        ruleDescription: 'Create internal, to match the external',
      }
    );
    // add env vars
    createMemberLambdaConstruct.addEnvironmentSalesforce();

    // allow the lambda access to the table
    membersTableConstruct.table.grantReadData(
      createMemberLambdaConstruct.lambdaFunction
    );
    membersTableConstruct.table.grantWriteData(
      createMemberLambdaConstruct.lambdaFunction
    );

    /**
     * Function: Update Member
     *
     * Subscribed to external event bus
     */
    const updateMemberLambdaConstruct = new LambdaEventSubscription(
      this,
      generateCompositeResourceId(stackId, 'member-update'),
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-member/main.ts'
        ),
        lambdaProps: lambdaPropsWithDestination,
        eventBus: externalEventBusConstruct.eventBus,
        ruleDetailType: 'putEvent',
        ruleDetails: {
          object: ['member'],
          type: ['updated'],
        },
        ruleDescription: 'Update internal, to match the external',
      }
    );
    // add env vars
    updateMemberLambdaConstruct.addEnvironmentSalesforce();

    // allow the lambda access to the table
    membersTableConstruct.table.grantReadData(
      updateMemberLambdaConstruct.lambdaFunction
    );
    membersTableConstruct.table.grantWriteData(
      updateMemberLambdaConstruct.lambdaFunction
    );

    /**
     * Find Member
     *
     * Available for use by other stacks
     */
    const findMemberLambdaConstruct = new LambdaConstruct(
      this,
      generateCompositeResourceId(stackId, 'member-find'),
      {
        lambdaEntry: pathResolve(__dirname, '../src/infra/find-member/main.ts'),
        lambdaProps: this.lambdaProps,
      }
    );

    // allow the lambda access to the table
    membersTableConstruct.table.grantReadData(
      findMemberLambdaConstruct.lambdaFunction
    );

    /**
     * Function: Upsert member source
     */
    const upsertMemberSourceResourceId = generateCompositeResourceId(
      stackId,
      'member-source-upsert'
    );
    const upsertMemberSourceLambdaConstruct = new LambdaConstruct(
      this,
      upsertMemberSourceResourceId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/upsert-member-source/main.ts'
        ),
        lambdaProps: this.lambdaProps,
      }
    );
    // add env vars
    upsertMemberSourceLambdaConstruct.addEnvironmentVars(requiredEnvVars);
    upsertMemberSourceLambdaConstruct.addEnvironmentAuth0();
    // upsertMemberSourceLambdaConstruct.addEnvironmentBettermode();
    upsertMemberSourceLambdaConstruct.addEnvironmentEdApp();
    // upsertMemberSourceLambdaConstruct.addEnvironmentSalesforce();
    upsertMemberSourceLambdaConstruct.addEnvironmentTribe();

    /**
     * State machine: Upsert member source multi
     */
    const upsertMemberSourceMultiId = generateCompositeResourceId(
      stackId,
      'member-source-upsert-multi'
    );
    const upsertMemberSourceMultiConstruct = new UpsertSourceMultiConstruct(
      this,
      upsertMemberSourceMultiId,
      {
        lambdas: {
          updateDomain: updateMemberLambdaConstruct,
          upsertSource: upsertMemberSourceLambdaConstruct,
        },
        entityId: 'member',
        sources: ['AUTH', 'COMMUNITY', 'MICRO-COURSE'],
      }
    );

    /**
     * Subscribing the state machine to the Create or Update Member Lambda (destination) events
     */
    const upsertMemberSourceMultiFromLambdaId = generateCompositeResourceId(
      upsertMemberSourceMultiId,
      'lambda'
    );
    const [upsertMemberSourceMultiRuleName, upsertMemberSourceMultiRuleTitle] =
      resourceNameTitle(upsertMemberSourceMultiFromLambdaId, 'Rule');
    const upsertMemberSourceFromLambdaRule = new events.Rule(
      this,
      upsertMemberSourceMultiRuleTitle,
      {
        ruleName: upsertMemberSourceMultiRuleName,
        eventBus: internalEventBusConstruct.eventBus,
        description: 'Upsert multiple group sources, based on internal event',
        eventPattern: {
          detailType: ['Lambda Function Invocation Result - Success'],
          source: ['lambda'],
          detail: {
            responsePayload: {
              entity: ['member-base', 'member'],
              outcome: ['success'],
            },
          },
        },
      }
    );
    upsertMemberSourceFromLambdaRule.addTarget(
      new targets.SfnStateMachine(upsertMemberSourceMultiConstruct.stateMachine)
    );

    /**
     * Subscribing the state machine to putEvents that may happen during step functions
     */
    const upsertMemberSourceMultiFromPutId = generateCompositeResourceId(
      upsertMemberSourceMultiId,
      'put'
    );
    const [
      upsertMemberSourceFromPutMultiRuleName,
      upsertMemberSourceFromPutMultiRuleTitle,
    ] = resourceNameTitle(upsertMemberSourceMultiFromPutId, 'Rule');
    const upsertMemberSourceFromPutRule = new events.Rule(
      this,
      upsertMemberSourceFromPutMultiRuleTitle,
      {
        ruleName: upsertMemberSourceFromPutMultiRuleName,
        eventBus: internalEventBusConstruct.eventBus,
        description: 'Upsert multiple group sources, based on internal event',
        eventPattern: {
          detailType: ['putEvent'],
          detail: {
            entity: ['member-base', 'member'],
            outcome: ['success'],
          },
        },
      }
    );
    upsertMemberSourceFromPutRule.addTarget(
      new targets.SfnStateMachine(upsertMemberSourceMultiConstruct.stateMachine)
    );

    /**
     * Allow the internal event bus to invoke the state machine
     */
    upsertMemberSourceMultiConstruct.stateMachine.grantStartExecution(
      internalEventBusConstruct.role
    );

    /**
     * Outputs
     * (If any)
     */
  }
}
