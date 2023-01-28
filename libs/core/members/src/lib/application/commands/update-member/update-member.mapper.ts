import { UpdateMapper } from '@curioushuman/common';

import { MemberSource } from '../../../domain/entities/member-source';
import { Member } from '../../../domain/entities/member';

export class UpdateMemberMapper extends UpdateMapper {
  /**
   * Returning an anonymous function here so we can combine the values
   * from both an existing member, and the source that will be overriding it
   *
   * NOTE: we do NOT update everything from the source
   */
  public static fromSourceToMember(
    member: Member
  ): (source: MemberSource) => Member {
    return (source: MemberSource) =>
      Member.check({
        ...member,
        status: source.status,

        name: source.name,
        email: source.email,
        organisationName: source.organisationName,
      });
  }
}
