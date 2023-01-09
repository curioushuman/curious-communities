import { Injectable } from '@nestjs/common';

import { FakeGroupSourceRepository } from './fake.group-source.repository';

@Injectable()
export class FakeGroupSourceCommunityRepository extends FakeGroupSourceRepository {}
