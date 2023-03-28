import * as cdk from 'aws-cdk-lib';
import * as destinations from 'aws-cdk-lib/aws-lambda-destinations';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLayerFrom,
  ChEventBusFrom,
  LambdaConstruct,
  generateCompositeResourceId,
  UpsertSourceMultiConstruct,
  RuleEntityEvent,
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
     * Required layers, additional to normal defaults
     */
    const chLayerMembers = new ChLayerFrom(this, 'cc-members-service');
    this.lambdaProps.layers?.push(chLayerMembers.layer);

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
     * - create participant step functions
     *
     * NOTE: destination is not invoked when called within step functions
     */
    const createMemberId = generateCompositeResourceId(
      stackId,
      'member-create'
    );
    const createMemberLambdaConstruct = new LambdaConstruct(
      this,
      createMemberId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/create-member/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        destinations: {
          onSuccess: {
            eventBus: internalEventBusConstruct.eventBus,
          },
        },
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
    const updateMemberId = generateCompositeResourceId(
      stackId,
      'member-update'
    );
    const updateMemberLambdaConstruct = new LambdaConstruct(
      this,
      updateMemberId,
      {
        lambdaEntry: pathResolve(
          __dirname,
          '../src/infra/update-member/main.ts'
        ),
        lambdaProps: this.lambdaProps,
        destinations: {
          onSuccess: {
            eventBus: internalEventBusConstruct.eventBus,
          },
        },
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
     * Subscribing the lambda to the external event bus
     */
    const updateMemberRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(updateMemberId, 'entity-event'),
      {
        eventBus: externalEventBusConstruct.eventBus,
        entity: ['member'],
        event: ['updated'],
        targets: [
          new targets.LambdaFunction(
            updateMemberLambdaConstruct.lambdaFunction
          ),
        ],
      }
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
    // allow the lambda access to the table
    membersTableConstruct.table.grantReadData(
      upsertMemberSourceLambdaConstruct.lambdaFunction
    );

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
     * Subscribing the state machine to the internal event bus
     */
    const updateMemberSourceMultiRuleConstruct = new RuleEntityEvent(
      this,
      generateCompositeResourceId(upsertMemberSourceMultiId, 'entity-event'),
      {
        eventBus: internalEventBusConstruct.eventBus,
        entity: ['member-base', 'member'],
        event: ['created', 'updated'],
        outcome: ['success'],
        targets: [
          new targets.SfnStateMachine(
            upsertMemberSourceMultiConstruct.stateMachine
          ),
        ],
      }
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
