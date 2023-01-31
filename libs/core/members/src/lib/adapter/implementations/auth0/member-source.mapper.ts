import { MemberSource } from '../../../domain/entities/member-source';
import { Source } from '../../../domain/value-objects/source';
import config from '../../../static/config';
import { Auth0ApiMemberSourceResponse } from './entities/member-source.response';

export class Auth0ApiMemberSourceMapper {
  public static toDomain(
    sourceResponse: Auth0ApiMemberSourceResponse,
    source: Source
  ): MemberSource {
    return MemberSource.check({
      id: sourceResponse.user_id,
      source,
      status: config.defaults.memberStatus,
      name: sourceResponse.name,
      email: sourceResponse.email,
      organisationName: sourceResponse.user_metadata?.organisation_name,
    });
  }
}
