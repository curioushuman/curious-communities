import * as events from 'aws-cdk-lib/aws-events';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Props required to initialize lambda event subscription
 *
 *
 */
export interface LambdaEventSubscriptionProps {
  lambdaEntry: string;
  lambdaProps: NodejsFunctionProps;
  eventBus: events.IEventBus;
  ruleDescription?: string;
  // We're mimic-ing the `RuleProps` interface from `aws-cdk-lib`
  // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_events.EventPattern.html
  ruleDetails?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  ruleSource?: string;
  ruleDetailType?: string;
  eventPattern?: events.EventPattern;
  lambdaArns?: string[];
}
