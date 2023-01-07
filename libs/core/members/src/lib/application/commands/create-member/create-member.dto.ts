import type { FindMemberDto } from '../../queries/find-member/find-member.dto';
import type { FindMemberSourceDto } from '../../queries/find-member-source/find-member-source.dto';

/**
 * This is the form of data our repository will expect for the command
 *
 * It happens to re-use the MemberSourceIdSource type, but this is not
 * required. It is just a convenience.
 */

export type CreateMemberDto = {
  findMemberDto: FindMemberDto;
  findMemberSourceDto: FindMemberSourceDto;
};
