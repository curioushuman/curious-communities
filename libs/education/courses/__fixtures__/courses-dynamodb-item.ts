import { DynamoDbItem } from '@curioushuman/common';

import { CoursesItem } from '../src/lib/adapter/implementations/dynamodb/entities/item';

export const participantDynamoDbItem: DynamoDbItem<CoursesItem> = {
  Member_Id: 'f79d794c-f167-4f38-bd9c-a903adb990b1',
  Sk_Participant_SourceIdCOURSE: 'b9ba3547-6953-4902-a4f3-903a66d4af2a',
  Course_Id: 'c2a30d8a-888b-43f4-b656-8d4a9cda26b0',
  Course_SourceIdCOURSE: 'COURSE#5009s000002APLoAAO',
  Participant_Status: 'pending',
  Member_OrganisationName: 'Curious Human',
  Sk_Course_Slug: 'b9ba3547-6953-4902-a4f3-903a66d4af2a',
  Member_Status: 'active',
  Member_SourceIdCRM: 'CRM#5009s000002APLoAAP',
  Course_Status: 'active',
  Course_DateClosed: 1678492800000,
  Course_Name: '2023 sync test case',
  primaryKey: 'c2a30d8a-888b-43f4-b656-8d4a9cda26b0',
  AccountOwner: 'apf',
  Member_Email: 'mike@curioushuman.com.au',
  Member_Name: 'Mike Kelly',
  Participant_Id: 'b9ba3547-6953-4902-a4f3-903a66d4af2a',
  Course_DateOpen: 1676851200000,
  Sk_Course_SourceIdCOURSE: 'b9ba3547-6953-4902-a4f3-903a66d4af2a',
  Participant_SourceIdCOURSE: 'COURSE#a0n9s000000G0kEAAS',
  sortKey: 'b9ba3547-6953-4902-a4f3-903a66d4af2a',
  Course_SupportType: 'facilitated',
  Course_Slug: '-sync-test-case',
  Sk_Member_Id: 'b9ba3547-6953-4902-a4f3-903a66d4af2a',
};

export const courseDynamoDbItem: DynamoDbItem<CoursesItem> = {
  Course_Id: 'c2a30d8a-888b-43f4-b656-8d4a9cda26b0',
  Course_SourceIdCOURSE: 'COURSE#5009s000002APLoAAO',
  Sk_Course_Slug: 'c2a30d8a-888b-43f4-b656-8d4a9cda26b0',
  Course_Status: 'active',
  Course_DateClosed: 1678492800000,
  Course_Name: '2023 sync test case',
  primaryKey: 'c2a30d8a-888b-43f4-b656-8d4a9cda26b0',
  AccountOwner: 'apf',
  Course_DateOpen: 1676851200000,
  Sk_Course_SourceIdCOURSE: 'c2a30d8a-888b-43f4-b656-8d4a9cda26b0',
  sortKey: 'c2a30d8a-888b-43f4-b656-8d4a9cda26b0',
  Course_SupportType: 'facilitated',
  Course_Slug: '-sync-test-case',
};

export const courseDomainItem = {
  id: 'c2a30d8a-888b-43f4-b656-8d4a9cda26b0',
  sourceIds: [
    {
      source: 'COURSE',
      id: '5009s000002APLoAAO',
    },
  ],
  slug: '-sync-test-case',
  status: 'active',
  supportType: 'facilitated',
  name: '2023 sync test case',
  dateOpen: 1676851200000,
  dateClosed: 1678492800000,
  accountOwner: 'apf',
};

export const memberDomainItem = {
  id: 'f79d794c-f167-4f38-bd9c-a903adb990b1',
  sourceIds: [
    {
      source: 'CRM',
      id: '5009s000002APLoAAP',
    },
  ],
  status: 'active',
  name: 'Mike Kelly',
  email: 'mike@curioushuman.com.au',
  organisationName: 'Curious Human',
  accountOwner: 'apf',
};

export const participantDomainItem = {
  id: 'b9ba3547-6953-4902-a4f3-903a66d4af2a',
  courseId: 'c2a30d8a-888b-43f4-b656-8d4a9cda26b0',
  memberId: 'f79d794c-f167-4f38-bd9c-a903adb990b1',
  sourceIds: [
    {
      source: 'COURSE',
      id: 'a0n9s000000G0kEAAS',
    },
  ],
  status: 'pending',
  accountOwner: 'apf',
  course: courseDomainItem,
  member: memberDomainItem,
};
