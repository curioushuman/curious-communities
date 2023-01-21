import isEqual from 'lodash.isequal';

/**
 * Generic class for update mapper
 */
export class UpdateMapper {
  /**
   * A test to see if anything has changed
   */
  public static requiresUpdate<T>(
    entity: T
  ): (updatedEntity: T) => T | undefined {
    return (updatedEntity: T) => {
      return isEqual(entity, updatedEntity) ? undefined : updatedEntity;
    };
  }
}
