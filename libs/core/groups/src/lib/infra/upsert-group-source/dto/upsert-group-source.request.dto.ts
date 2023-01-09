import { Record, Static, String } from 'runtypes';
import { GroupResponseDto } from '../../dto/group.response.dto';

/**
 * Externally facing DTO for find function
 */

export const UpsertGroupSourceRequestDto = Record({
  source: String,
  group: GroupResponseDto,
});

export type UpsertGroupSourceRequestDto = Static<
  typeof UpsertGroupSourceRequestDto
>;
