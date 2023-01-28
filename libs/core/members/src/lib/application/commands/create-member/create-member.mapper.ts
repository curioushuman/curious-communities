import { MemberSource } from '../../../domain/entities/member-source';
import { Member } from '../../../domain/entities/member';
import { createMemberId } from '../../../domain/value-objects/member-id';
import config from '../../../static/config';

export class CreateMemberMapper {
  /**
   * TODO:
   * - [ ] introduce a better means of this module knowing which source it
   *       is being created FROM (if we ever allow this)
   */
  public static fromSourceToMember(memberSource: MemberSource): Member {
    return Member.check({
      id: createMemberId(),
      status: memberSource.status,

      sourceIds: [
        {
          id: memberSource.id,
          // NOTE: currently we're only creating FROM a single source
          //      so we can hardcode this
          source: config.defaults.primaryAccountSource,
        },
      ],

      name: memberSource.name,
      email: memberSource.email,
      organisationName: memberSource.organisationName,

      accountOwner: config.defaults.accountOwner,
    });
  }
}
