import { Injectable } from '@nestjs/common';

import { FakeMemberSourceRepository } from './fake.member-source.repository';

@Injectable()
export class FakeMemberSourceMicroCourseRepository extends FakeMemberSourceRepository {}
