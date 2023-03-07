import { MemberSource } from '../../../domain/entities/member-source';
import { Member } from '../../../domain/entities/member';
import { createMemberId } from '../../../domain/value-objects/member-id';
import config from '../../../static/config';

export class CreateMemberMapper {
  public static fromSourceToMember(memberSource: MemberSource): Member {
    return Member.check({
      id: createMemberId(),
      status: memberSource.status,
      sourceOrigin: memberSource.source,
      sourceIds: [
        {
          id: memberSource.id,
          source: memberSource.source,
        },
      ],

      name: memberSource.name,
      email: memberSource.email,
      organisationName: memberSource.organisationName,

      accountOwner: config.defaults.accountOwner,
    });
  }
}
