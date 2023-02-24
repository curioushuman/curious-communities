import { Static, String } from 'runtypes';

/**
 * Stagename can only be one of the following:
 */
export type StageName = 'dev' | 'prod';

/**
 * Regex check for our resource ID
 */
export const ResourceIdRegex = /^([0-9a-z-])+|([0-9A-Z-])+$/;

/**
 * Runtype definition for our resource IDs
 */
export const ResourceId = String.withConstraint(
  (maybeResourceID) =>
    ResourceIdRegex.test(maybeResourceID) || 'Invalid resource Id'
);

/**
 * All resource IDs should follow the format
 * - some-resource-name
 */
export type ResourceId = Static<typeof ResourceId>;

/**
 * Regex check for our resource name
 */
export const ResourceNameRegex = /^[0-9a-zA-Z]+$/;

/**
 * Runtype definition for our resource names
 */
export const ResourceName = String.withConstraint(
  (maybeResourceName) =>
    ResourceNameRegex.test(maybeResourceName) || 'Invalid resource Name'
);

/**
 * All resource IDs should follow the format
 * - some-resource-name
 */
export type ResourceName = Static<typeof ResourceName>;

/**
 * A tuple that will return resource name and title
 */
export type ResourceNameTitle = [ResourceName, ResourceName];

/**
 * We currently only support a few AWS resources for naming
 *
 * TODO: improve or remove this
 */
export type SupportedResourceType =
  | 'Api'
  | 'DynamoDbTable'
  | 'DynamoDbGSI'
  | 'DynamoDbLSI'
  | 'EventBus'
  | 'Lambda'
  | 'Layer'
  | 'Queue'
  | 'RequestValidator'
  | 'ResponseModel'
  | 'Role'
  | 'Rule'
  | 'SfnParallel'
  | 'SfnPass'
  | 'SfnStateMachine'
  | 'SfnTask'
  | 'SsmParameter'
  | 'Stack'
  | 'Topic';
