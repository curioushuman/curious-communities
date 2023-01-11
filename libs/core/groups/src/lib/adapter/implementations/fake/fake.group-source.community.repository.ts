import { Injectable } from '@nestjs/common';
import { Source } from '../../../domain/value-objects/source';

import { FakeGroupSourceRepository } from './fake.group-source.repository';

@Injectable()
export class FakeGroupSourceCommunityRepository extends FakeGroupSourceRepository {
  override readonly source: Source = 'COMMUNITY';
}
