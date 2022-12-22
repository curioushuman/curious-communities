import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import { resourceNameTitle } from '../utils/name';
import { LambdaEventSubscriptionProps } from './lambda-event-subscription.types';
import { LambdaConstruct } from './lambda.construct';

/**
 * Create a lambda function and subscribe it to an event bus

 * TODO:
 * - [ ] idempotency
 *       https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/
 * - [ ] configure retry attempts (upon failure)
 */
export class LambdaEventSubscription extends Construct {
  public lambdaFunction: NodejsFunction;

  constructor(
    scope: Construct,
    id: string,
    props: LambdaEventSubscriptionProps
  ) {
    super(scope, id);

    // create the lambda function
    const { lambdaEntry, lambdaProps } = props;
    const lambdaConstruct = new LambdaConstruct(this, id, {
      lambdaEntry,
      lambdaProps,
    });
    this.lambdaFunction = lambdaConstruct.lambdaFunction;

    /**
     * Rule: Create Course when course source is created
     */
    const [ruleName, ruleTitle] = resourceNameTitle(id, 'Rule');
    const rule = new events.Rule(this, ruleTitle, {
      ruleName,
      eventBus: props.eventBus,
      description: props.ruleDescription,
      eventPattern: {
        detailType: ['putEvent'],
        detail: props.ruleDetails,
      },
    });
    rule.addTarget(new targets.LambdaFunction(this.lambdaFunction));
  }
}