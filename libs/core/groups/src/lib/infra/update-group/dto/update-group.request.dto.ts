import { Optional, Record, Static } from 'runtypes';
import { RequestSource } from '@curioushuman/common';
import { GroupBaseResponseDto } from '../../dto/group.response.dto';

/**
 * DTO that accepts any of the identifiers
 */
export const UpdateGroupRequestDto = Record({
  group: GroupBaseResponseDto,
  requestSource: Optional(RequestSource),
});

/**
 * DTO that accepts any of the identifiers
 */
export type UpdateGroupRequestDto = Static<typeof UpdateGroupRequestDto>;
