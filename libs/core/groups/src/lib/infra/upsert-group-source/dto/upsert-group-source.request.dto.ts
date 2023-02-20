import { Record, Static, String } from 'runtypes';
import { GroupBaseResponseDto } from '../../dto/group.response.dto';

/**
 * Externally facing DTO for upsert function
 *
 * TODO
 * - [ ] find a better way for this module to know what source it uses
 */

export const UpsertGroupSourceRequestDto = Record({
  source: String,
  group: GroupBaseResponseDto,
});

export type UpsertGroupSourceRequestDto = Static<
  typeof UpsertGroupSourceRequestDto
>;
