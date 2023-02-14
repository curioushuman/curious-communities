import { CourseSupportType } from '../domain/value-objects/course-support-type';

export default {
  defaults: {
    accountOwner: 'apf',
    courseSupportType: 'facilitated' as CourseSupportType,
    accountSources: ['COURSE'],
    memberAccountSources: ['AUTH', 'COURSE', 'COMMUNITY', 'MICRO-COURSE'],
    primaryAccountSource: 'COURSE',
  },
};
