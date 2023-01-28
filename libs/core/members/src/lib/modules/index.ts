import { FindMemberSourceCrmModule } from './crm/find-member-source.module';
import { UpsertMemberSourceCrmModule } from './crm/upsert-member-source.module';

// NOTE: modules inherently have an any type
// functions like createApplicationContext accept any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const upsertMemberSourceModules: Record<string, any> = {
  CRM: UpsertMemberSourceCrmModule,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const findMemberSourceModules: Record<string, any> = {
  CRM: FindMemberSourceCrmModule,
};
