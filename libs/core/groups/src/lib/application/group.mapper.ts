import { Group } from '../domain/entities/group';
import { GroupSource } from '../domain/entities/group-source';
import { createGroupSlug } from '../domain/value-objects/group-slug';
import config from '../static/config';
import { createYearMonth } from '@curioushuman/common';

/**
 * TODO
 * - Should we do more checking of GroupResponseDto?
 */
export class GroupMapper {
  public static fromSourceToGroup(source: GroupSource): Group {
    return Group.check({
      id: source.id,
      slug: createGroupSlug(source),
      status: source.status,
      supportType: config.defaults.groupSupportType,
      name: source.name,
      dateOpen: source.dateOpen,
      dateClosed: source.dateClosed,
      yearMonthOpen: createYearMonth(source.dateOpen),
      accountOwner: config.defaults.accountOwner,
    });
  }
}
