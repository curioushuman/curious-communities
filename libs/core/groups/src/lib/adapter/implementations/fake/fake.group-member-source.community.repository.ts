import { Injectable } from '@nestjs/common';
import { Source } from '../../../domain/value-objects/source';

import { FakeGroupMemberSourceRepository } from './fake.group-member-source.repository';

@Injectable()
export class FakeGroupMemberSourceCommunityRepository extends FakeGroupMemberSourceRepository {
  override readonly source: Source = 'COMMUNITY';
}
