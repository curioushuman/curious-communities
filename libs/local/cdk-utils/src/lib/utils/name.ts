/**
 * Functions used for consistent naming of resources
 */

import {
  ResourceId,
  ResourceNameTitle,
  SupportedResourceType,
} from './name.types';

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
  return `${camelCase(ResourceId.check(resourceId))}${resourceType}`;
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
 * Converting a dashed string to camelCase
 */
function camelCase(str: string): string {
  return str
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
}
