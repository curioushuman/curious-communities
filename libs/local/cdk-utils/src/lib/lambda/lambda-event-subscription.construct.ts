import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

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
export class LambdaEventSubscription extends LambdaConstruct {
  constructor(
    scope: Construct,
    id: string,
    props: LambdaEventSubscriptionProps
  ) {
    const { lambdaEntry, lambdaProps } = props;
    super(scope, id, { lambdaEntry, lambdaProps });

    /**
     * Rule
     */
    const [ruleName, ruleTitle] = resourceNameTitle(id, 'Rule');
    const rule = new events.Rule(this, ruleTitle, {
      ruleName,
      eventBus: props.eventBus,
      description: props.ruleDescription,
      eventPattern: {
        detailType: [props.ruleDetailType || 'putEvent'],
        source: props.ruleSource ? [props.ruleSource] : undefined,
        detail: props.ruleDetails,
      },
    });
    rule.addTarget(new targets.LambdaFunction(this.lambdaFunction));
  }
}
