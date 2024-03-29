import * as events from 'aws-cdk-lib/aws-events';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { resourceNameTitle } from '../utils/name';
import {
  RuleEntityEventProps,
  RuleEntityEventSourceDetailType,
} from './rule-entity-event.types';

/**
 * A standard way of creating our rules for entity events
 *
 * TODO:
 * - [ ] outcome, entity and event should be drawn from CoAwsRequestPayload types
 */
export class RuleEntityEvent extends Construct {
  public rule: events.Rule;
  // public rules: events.Rule[] = [];

  constructor(
    scope: Construct,
    constructId: string,
    props: RuleEntityEventProps
  ) {
    super(scope, constructId);

    const { entity, event, outcome, eventBus, targets } = props;

    // prepare the specific event pattern
    // matches to CoAwsRequestPayload
    // Ref: /libs/shared/common/src/lib/infra/__types__/aws-response-payload.ts
    const entityEvent = {
      entity,
      event,
      outcome,
    };

    // add a description, or default
    const description =
      props.description ||
      `Rule for ${props.entity} events on ${props.eventBus.eventBusName}`;

    // prepare the source lambdas
    // Optional: will be undefined if no lambdas are provided
    const resources = this.prepareSourceLambdas(props.source?.lambdas);

    // prepare the detailType
    // Optional: will be undefined if no detailType provided
    const detailType = this.prepareSourceDetailType(props.source?.detailType);

    // Single rule
    const [ruleName, ruleTitle] = resourceNameTitle(constructId, 'Rule');
    this.rule = new events.Rule(this, ruleTitle, {
      ruleName,
      eventBus,
      description,
      eventPattern: {
        resources,
        detailType,
        detail: {
          $or: [
            // putEvent
            entityEvent,
            // lambda success destination
            {
              responsePayload: entityEvent,
            },
          ],
        },
      },
      targets,
    });

    // Two rule version
    // const rulePutEventId = generateCompositeResourceId(
    //   constructId,
    //   'put-event'
    // );
    // const [rulePutEventName, rulePutEventTitle] = resourceNameTitle(
    //   rulePutEventId,
    //   'Rule'
    // );
    // const rulePutEvent = new events.Rule(this, rulePutEventTitle, {
    //   ruleName: rulePutEventName,
    //   eventBus,
    //   description,
    //   eventPattern: {
    //     resources,
    //     detailType,
    //     detail: entityEvent,
    //   },
    //   targets,
    // });
    // this.rules.push(rulePutEvent);

    // const ruleLambdaSuccessId = generateCompositeResourceId(
    //   constructId,
    //   'lambda-success'
    // );
    // const [ruleLambdaSuccessName, ruleLambdaSuccessTitle] = resourceNameTitle(
    //   ruleLambdaSuccessId,
    //   'Rule'
    // );
    // const roleLambdaSuccess = new events.Rule(this, ruleLambdaSuccessTitle, {
    //   ruleName: ruleLambdaSuccessName,
    //   eventBus,
    //   description,
    //   eventPattern: {
    //     resources,
    //     detailType,
    //     detail: {
    //       responsePayload: entityEvent,
    //     },
    //   },
    //   targets,
    // });
    // this.rules.push(roleLambdaSuccess);
  }

  private prepareSourceLambdas(lambdas: lambda.IFunction[] | undefined) {
    if (!lambdas) {
      return undefined;
    }
    return lambdas.map((lambda) => `${lambda.functionArn}:$LATEST`);
  }

  private prepareSourceDetailType(
    detailType: RuleEntityEventSourceDetailType[] | undefined
  ) {
    if (!detailType) {
      return undefined;
    }
    return detailType.map((dt) => RuleEntityEventSourceDetailType[dt]);
  }
}
