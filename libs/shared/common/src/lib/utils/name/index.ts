/**
 * Functions used for consistent naming of resources
 */
import { dashToCamelCase } from '../functions';
import {
  ResourceId,
  ResourceNameTitle,
  SupportedResourceType,
} from './__types__';

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
  return `${dashToCamelCase(ResourceId.check(resourceId))}${resourceType}`;
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
