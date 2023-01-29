import { SourceInvalidError } from '@curioushuman/error-factory';
import {
  ExternalIdSource,
  findSourceIdAsValue,
  guardExternalIdSourceValue,
  SourceOfSourceId,
  processExternalIdSourceValue,
} from '../../../domain/value-objects/external-id-source';
import { DynamoDbItemKeys } from './entities/item';

export class DynamoDbMapper {
  /**
   * Map persistence sources ids to domain source ids
   *
   * Notes:
   * - I is for (DynamoDb)Item
   * - SID is for (Domain)SourceIdSource
   *
   * - type casting as we've just checked it's not null
   *
   * TODO:
   * - [ ] remove the type casting
   * - [ ] refactor
   */
  public static prepareDomainSourceIds<
    I extends DynamoDbItemKeys,
    SID extends ExternalIdSource
  >(item: I, entityId: string, sources: SourceOfSourceId<SID>[]): SID[] {
    const sourceIds: SID[] = [];
    sources.forEach((sourceKey) => {
      // this type cast is ok, as we're about to check it
      const itemKey = `${entityId}_SourceId${sourceKey}` as keyof I;
      if (!(itemKey in item)) {
        return;
      }
      // * NOTE: typescript needs you to cast as unknown prior to typeof guard
      const idSourceValue: unknown = item[itemKey];
      // I'm semi-confident of the 'as SID' as we're only accepting SID.sources above
      // ! we'll get into trouble if we ever do proper type checking on external Ids
      if (typeof idSourceValue !== 'string') {
        return;
      }
      if (!guardExternalIdSourceValue(idSourceValue, sources)) {
        const ik = typeof itemKey === 'string' ? `.${itemKey}` : '';
        throw new SourceInvalidError(
          `${entityId}${ik} with id ${item.primaryKey} contains invalid data`
        );
      }
      // we are type casting as we've checked things manually in the guard
      sourceIds.push(processExternalIdSourceValue(idSourceValue) as SID);
    });
    return sourceIds;
  }

  /**
   * Map domain sources ids to persistence source fields
   *
   * NOTES
   * - SID is for (Domain)SourceIdSource
   */
  public static preparePersistenceSourceIdFields<SID extends ExternalIdSource>(
    sourceIds: SID[],
    entityId: string,
    sources: SourceOfSourceId<SID>[],
    prefix = ''
  ): Record<string, string | undefined> {
    const sourceIdsConverted: Record<string, string | undefined> = {};
    sources.forEach((sourceKey) => {
      sourceIdsConverted[`${prefix}${entityId}_SourceId${sourceKey}`] =
        findSourceIdAsValue<SID>(sourceIds, sourceKey);
    });
    return sourceIdsConverted;
  }

  /**
   * Map domain sources ids to persistence source ids
   *
   * NOTES
   * - SID is for (Domain)SourceIdSource
   */
  public static preparePersistenceSourceIds<SID extends ExternalIdSource>(
    sourceIds: SID[],
    entityId: string,
    sources: SourceOfSourceId<SID>[]
  ): Record<string, string | undefined> {
    return DynamoDbMapper.preparePersistenceSourceIdFields(
      sourceIds,
      entityId,
      sources,
      'Sk_'
    );
  }
}
