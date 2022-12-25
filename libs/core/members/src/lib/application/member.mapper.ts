import { Member } from '../domain/entities/member';
import { MemberSource } from '../domain/entities/member-source';
import { createMemberSlug } from '../domain/value-objects/member-slug';
import config from '../static/config';

/**
 * TODO
 * - Should we do more checking of MemberResponseDto?
 */
export class MemberMapper {
  public static fromSourceToMember(source: MemberSource): Member {
    return Member.check({
      externalId: source.id,
      slug: createMemberSlug(source),
      status: source.status,
      name: source.name,
      email: source.email,
      organisationName: source.organisationName,
      accountOwner: config.defaults.accountOwner,
    });
  }
}
