import * as events from 'aws-cdk-lib/aws-events';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Props required to initialize lambda event subscription
 */
export interface LambdaEventSubscriptionProps {
  lambdaEntry: string;
  lambdaProps: NodejsFunctionProps;
  eventBus: events.IEventBus;
  ruleDetails?: {
    // We're mimic-ing the `RuleProps` interface from `aws-cdk-lib`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  ruleDescription?: string;
}
