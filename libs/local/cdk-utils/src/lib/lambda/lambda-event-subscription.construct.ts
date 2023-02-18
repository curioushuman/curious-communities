import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

import { resourceNameTitle } from '../utils/name';
import { LambdaEventSubscriptionProps } from './lambda-event-subscription.types';
import { LambdaConstruct } from './lambda.construct';

/**
 * Convenience construct to create a lambda function and subscribe it to an event bus.
 *
 * You can give it:
 * - basic rule details as if it is a putEvent
 * - a list of lambdas, to listen to (as if this lambda was the destination)
 * - an event pattern; i.e. just as AWS allows
 *
 * TODO:
 * - [ ] improve the incoming props interface
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
     * Event Pattern
     */
    const eventPattern = this.prepareEventPattern(props);

    /**
     * Rule
     */
    const [ruleName, ruleTitle] = resourceNameTitle(id, 'Rule');
    const rule = new events.Rule(this, ruleTitle, {
      ruleName,
      eventBus: props.eventBus,
      description: props.ruleDescription,
      eventPattern,
    });
    rule.addTarget(new targets.LambdaFunction(this.lambdaFunction));
  }

  private prepareEventPattern(
    props: LambdaEventSubscriptionProps
  ): events.EventPattern {
    if (props.lambdaArns) {
      return this.prepareLambdaListenersEventPattern(props.lambdaArns);
    }
    return props.eventPattern || this.prepareRulesBasedEventPattern(props);
  }

  private prepareLambdaListenersEventPattern(
    lambdaArns: string[]
  ): events.EventPattern {
    return {
      detailType: ['Lambda Function Invocation Result - Success'],
      source: ['lambda'],
      resources: lambdaArns.map((lambdaArn) => `${lambdaArn}:$LATEST`),
    };
  }

  private prepareRulesBasedEventPattern(
    props: LambdaEventSubscriptionProps
  ): events.EventPattern {
    return {
      detailType: [props.ruleDetailType || 'putEvent'],
      source: props.ruleSource ? [props.ruleSource] : undefined,
      detail: props.ruleDetails,
    };
  }
}
