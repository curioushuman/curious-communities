import { InternalRequestInvalidError } from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';
import { CoAwsResponsePayloadBase } from '../__types__';

/**
 * Response payload predicate
 * https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */
export function isResponsePayload<EntityName>(
  event: unknown
): event is CoAwsResponsePayloadBase<EntityName> {
  return (
    (event as CoAwsResponsePayloadBase<EntityName>).event !== undefined &&
    (event as CoAwsResponsePayloadBase<EntityName>).outcome !== undefined &&
    (event as CoAwsResponsePayloadBase<EntityName>).detail !== undefined
  );
}

type CheckForNullRequestPayloadProps = {
  requestPayload: unknown | null;
  context?: string;
  logger?: LoggableLogger;
};

/**
 * This function was introduced when we switched from using null to communicate no-change
 * to response payloads.
 */
export function checkForNullRequestPayload(
  props: CheckForNullRequestPayloadProps
): void {
  if (props.requestPayload === null) {
    const context = props.context || 'checkForNullRequestPayload';
    // NOTE: this is a 500 error, not a 400
    const error = new InternalRequestInvalidError(
      `NULL request payload detected`
    );
    // we straight out log this, as it's a problem our systems
    // aren't communicating properly.
    if (props.logger) {
      props.logger.debug(props.requestPayload, context);
      props.logger.error(error, context);
    }
    throw error;
  }
}

type ValidatedRequestPayloadProps<T> = {
  requestPayload: T;
  checkRequest: (request: T) => boolean;
  context?: string;
  logger?: LoggableLogger;
};

/**
 * We added this at the same time, to make throwing internal request errors more consistent
 */
export function validateRequestPayload<T>(
  props: ValidatedRequestPayloadProps<T>
): T {
  if (!props.requestPayload || !props.checkRequest(props.requestPayload)) {
    const contextStr = props.context ? ` (${props.context})` : '';
    // NOTE: this is a 500 error, not a 400
    const error = new InternalRequestInvalidError(
      `Invalid payload detected${contextStr}`
    );
    // we straight out log this, as it's a problem our systems
    // aren't communicating properly.
    if (props.logger) {
      props.logger.verbose(props.requestPayload);
      props.logger.error(error);
    }
    throw error;
  }
  return props.requestPayload;
}
