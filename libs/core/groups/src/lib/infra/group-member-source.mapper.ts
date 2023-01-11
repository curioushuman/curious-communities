import { GroupMemberSourceResponseDto } from './dto/group-member-source.response.dto';
import { GroupMemberSource } from '../domain/entities/group-member-source';

/**
 * TODO
 * - Should we do more checking of GroupMemberSourceResponseDto?
 */
export class GroupMemberSourceMapper {
  public static toResponseDto(
    memberSource: GroupMemberSource
  ): GroupMemberSourceResponseDto {
    return {
      id: memberSource.id,
      groupId: memberSource.groupId,
      status: memberSource.status,

      name: memberSource.name,
      email: memberSource.email,
      organisationName: memberSource.organisationName,
    } as GroupMemberSourceResponseDto;
  }
}
