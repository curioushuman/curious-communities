import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';

/**
 * The two types of detail types we support
 * As an ENUM
 */
export const RuleEntityEventSourceDetailType = {
  'PUT-EVENT': 'putEvent',
  'LAMBDA-SUCCESS': 'Lambda Function Invocation Result - Success',
} as const;

/**
 * The two types of detail types we support
 * As a type
 */
export type RuleEntityEventSourceDetailType =
  keyof typeof RuleEntityEventSourceDetailType;

/**
 * Possible sources for an entity event
 */
export interface RuleEntityEventSource {
  detailType?: RuleEntityEventSourceDetailType[];
  lambdas?: lambda.IFunction[];
}

/**
 * This is a pattern that AWS EventBridge supports for it's eventPattern matching
 * There are more wer should probably implement (or find a type for)
 * Ref: https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-patterns-content-based-filtering.html
 */
interface RuleEntityEventEntitySuffix {
  suffix: string;
}
type RuleEntityEventEntity = string | RuleEntityEventEntitySuffix;

/**
 * Props for setting up a rule for an entity event
 *
 * TODO:
 * - [ ] outcome, entity and event should be drawn from CoAwsRequestPayload types
 */
export interface RuleEntityEventProps {
  entity: RuleEntityEventEntity[];
  eventBus: events.IEventBus;
  event?: string[];
  outcome?: string[];
  description?: string;
  targets?: events.IRuleTarget[];
  source?: RuleEntityEventSource;
}
