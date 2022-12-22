import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { resolve as pathResolve } from 'path';

import { resourceNameTitle } from '@curioushuman/cdk-utils';

/**
 * Props required to initialize this Construct
 */
export interface CreateProps {
  eventBus: events.IEventBus;
  table: dynamodb.ITable;
  lambdaProps: Partial<lambda.FunctionProps>;
}

/**
 * Function: Create Course
 *
 * NOTES:
 * - functionName required for importing into other stacks
 *
 * TODO:
 * - [ ] idempotency
 *       https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/
 * - [ ] configure retry attempts (upon failure)
 */
export class CreateConstruct extends Construct {
  constructor(scope: Construct, id: string, props: CreateProps) {
    super(scope, id);

    const [functionName, functionTitle] = resourceNameTitle(id, 'Lambda');
    const lambdaFunction = new NodejsFunction(this, functionTitle, {
      functionName: functionName,
      entry: pathResolve(__dirname, './main.ts'),
      ...props.lambdaProps,
    });
    // ALWAYS ADD TAGS
    // TODO - add better tags
    cdk.Tags.of(lambdaFunction).add('identifier', functionTitle);

    // allow create to read and write
    props.table.grantReadData(lambdaFunction);
    props.table.grantWriteData(lambdaFunction);

    /**
     * Rule: Create Course when course source is opened
     */
    const [ruleName, ruleTitle] = resourceNameTitle(
      'cc-courses-create',
      'Rule'
    );
    const rule = new events.Rule(this, ruleTitle, {
      ruleName,
      eventBus: props.eventBus,
      description:
        'When a course source is created, create a course internally',
      eventPattern: {
        detailType: ['putEvent'],
        detail: {
          object: ['course'],
          type: ['status-updated'],
          status: ['created'],
        },
      },
    });
    rule.addTarget(new targets.LambdaFunction(lambdaFunction));
  }
}
