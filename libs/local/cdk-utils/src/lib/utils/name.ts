/**
 * Functions used for consistent naming of resources
 */

// TODO - get this working when you move this to a package
// import { dashToCamelCase } from '@curioushuman/common';
import {
  ResourceId,
  ResourceNameTitle,
  SupportedResourceType,
} from './name.types';

export function dashToUpperCaseFirst(str: string): string {
  return str
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
}

export function dashToCamelCase(str: string): string {
  const upper = dashToUpperCaseFirst(str);
  return upper[0].toLowerCase() + upper.slice(1);
}

/**
 * A key is a unique identifier used in an array or object context
 */
export const transformIdToKey = (resourceId: ResourceId): string => {
  return dashToCamelCase(ResourceId.check(resourceId));
};

/**
 * A name is used only in AWS naming
 */
export const transformIdToName = (resourceId: ResourceId): string => {
  return dashToUpperCaseFirst(ResourceId.check(resourceId));
};

/**
 * A resource name needs to be unique across AWS, so is prefixed with the API name,
 * name prefix AND Cc
 */
export const transformIdToResourceName = (
  resourceId: ResourceId,
  resourceType: SupportedResourceType
): string => {
  const prefix = process.env.AWS_NAME_PREFIX || '';
  return `${prefix}${transformIdToResourceTitle(resourceId, resourceType)}`;
};
export const transformIdToTestResourceName = (
  resourceId: ResourceId,
  resourceType: SupportedResourceType
): string => {
  return `Test${transformIdToResourceName(resourceId, resourceType)}`;
};

/**
 * A resource title needs only be unique within the context of the current API
 */
export const transformIdToResourceTitle = (
  resourceId: ResourceId,
  resourceType: SupportedResourceType
): string => {
  return `${dashToUpperCaseFirst(ResourceId.check(resourceId))}${resourceType}`;
};
export const transformIdToTestResourceTitle = (
  resourceId: ResourceId,
  resourceType: SupportedResourceType
): string => {
  return `Test${transformIdToResourceTitle(resourceId, resourceType)}`;
};

/**
 * Convenience function that returns both name and title
 */
export const resourceNameTitle = (
  resourceId: ResourceId,
  resourceType: SupportedResourceType
): ResourceNameTitle => {
  return [
    transformIdToResourceName(resourceId, resourceType),
    transformIdToResourceTitle(resourceId, resourceType),
  ];
};
export const testResourceNameTitle = (
  resourceId: ResourceId,
  resourceType: SupportedResourceType
): ResourceNameTitle => {
  return [
    transformIdToTestResourceName(resourceId, resourceType),
    transformIdToTestResourceTitle(resourceId, resourceType),
  ];
};

/**
 * Convenience function to create a test resource Id
 */
export const testResourceId = (resourceId: ResourceId): ResourceId => {
  return `test-${ResourceId.check(resourceId)}`;
};

/**
 * Function to generate a composite Id from a resource Id and a sub-resource Id
 */
export const generateCompositeResourceId = (
  resourceId: ResourceId,
  subResourceId: ResourceId
): ResourceId => {
  return `${ResourceId.check(resourceId)}-${ResourceId.check(subResourceId)}`;
};
