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
 * - an entire event pattern, which will override anything else you give it
 * - a ruleDetailType, which means you're using a putEvent or something more specific
 *   - supports rule details and source
 * - OR it defaults to assuming you're listening for a lambda success destination type event
 *   - supports list of lambdas to listen for AND a detail pattern to pay attention to
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
    if (props.eventPattern) {
      return props.eventPattern;
    }
    return props.ruleDetailType
      ? this.prepareRulesBasedEventPattern(props)
      : this.prepareLambdaListenersEventPattern(props);
  }

  private prepareResources(lambdaArns: string[] | undefined) {
    if (!lambdaArns) {
      return undefined;
    }
    return lambdaArns.map((lambdaArn) => `${lambdaArn}:$LATEST`);
  }

  private prepareLambdaListenersEventPattern(
    props: LambdaEventSubscriptionProps
  ): events.EventPattern {
    if (!props.lambdaArns && !props.ruleDetails) {
      throw new Error('Must provide either lambdaArns or ruleDetails');
    }
    return {
      detailType: ['Lambda Function Invocation Result - Success'],
      source: ['lambda'],
      resources: this.prepareResources(props.lambdaArns),
      detail: {
        responsePayload: props.ruleDetails,
      },
    };
  }

  private prepareRulesBasedEventPattern(
    props: LambdaEventSubscriptionProps
  ): events.EventPattern {
    if (!props.ruleSource && !props.ruleDetails) {
      throw new Error('Must provide either ruleSource or ruleDetails');
    }
    return {
      detailType: [props.ruleDetailType || 'putEvent'],
      source: props.ruleSource ? [props.ruleSource] : undefined,
      detail: props.ruleDetails,
    };
  }
}
