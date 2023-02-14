import { Null, Optional, Record, Static } from 'runtypes';
import { GroupBase } from '../../../domain/entities/group';
import { GroupMemberSource } from '../../../domain/entities/group-member-source';
import { ParticipantDto } from '../../../domain/entities/participant.dto';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateGroupMemberDto = Record({
  group: GroupBase,
  participant: Optional(ParticipantDto.Or(Null)),
  groupMemberSource: Optional(GroupMemberSource.Or(Null)),
}).withConstraint((dto) => !!(dto.participant || dto.groupMemberSource));

export type CreateGroupMemberDto = Static<typeof CreateGroupMemberDto>;
