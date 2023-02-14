import { UpsertGroupMemberSourceCommunityModule } from './community/upsert-group-member-source.module';
import { UpsertGroupSourceCommunityModule } from './community/upsert-group-source.module';
import { UpsertGroupMemberSourceMicroCourseModule } from './micro-course/upsert-group-member-source.module';
import { UpsertGroupSourceMicroCourseModule } from './micro-course/upsert-group-source.module';

// NOTE: modules inherently have an any type
// functions like createApplicationContext accept any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const upsertGroupSourceModules: Record<string, any> = {
  COMMUNITY: UpsertGroupSourceCommunityModule,
  'MICRO-COURSE': UpsertGroupSourceMicroCourseModule,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const upsertGroupMemberSourceModules: Record<string, any> = {
  COMMUNITY: UpsertGroupMemberSourceCommunityModule,
  'MICRO-COURSE': UpsertGroupMemberSourceMicroCourseModule,
};
