import { FindMemberSourceAuthModule } from './auth/find-member-source.module';
import { UpsertMemberSourceAuthModule } from './auth/upsert-member-source.module';
import { FindMemberSourceCommunityModule } from './community/find-member-source.module';
import { UpsertMemberSourceCommunityModule } from './community/upsert-member-source.module';
import { FindMemberSourceCrmModule } from './crm/find-member-source.module';
import { UpsertMemberSourceCrmModule } from './crm/upsert-member-source.module';
import { FindMemberSourceMicroCourseModule } from './micro-course/find-member-source.module';
import { UpsertMemberSourceMicroCourseModule } from './micro-course/upsert-member-source.module';

// NOTE: modules inherently have an any type
// functions like createApplicationContext accept any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const upsertMemberSourceModules: Record<string, any> = {
  CRM: UpsertMemberSourceCrmModule,
  AUTH: UpsertMemberSourceAuthModule,
  COMMUNITY: UpsertMemberSourceCommunityModule,
  'MICRO-COURSE': UpsertMemberSourceMicroCourseModule,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const findMemberSourceModules: Record<string, any> = {
  CRM: FindMemberSourceCrmModule,
  AUTH: FindMemberSourceAuthModule,
  COMMUNITY: FindMemberSourceCommunityModule,
  'MICRO-COURSE': FindMemberSourceMicroCourseModule,
};
