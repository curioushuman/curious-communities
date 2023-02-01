import { loadFeature, defineFeature } from 'jest-cucumber';

import { DynamoDbMemberMapper } from '../member.mapper';
import { MembersDynamoDbItem } from '../entities/item';
import { Member } from '../../../../domain/entities/member';
import { MemberBuilder } from '../../../../test/builders/member.builder';

/**
 * UNIT TEST
 * SUT = DynamoDbMapper
 *
 * Scope
 * - mapping helper functions
 */

const feature = loadFeature('./member.mapper.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let validPersistenceItem: MembersDynamoDbItem;
  let validMember: Member;

  beforeAll(() => {
    const member = MemberBuilder().build();
    validPersistenceItem = {
      primaryKey: member.id,
      sortKey: member.id,
      Member_SourceIdCRM: 'CRM#crm.id',
      Member_SourceIdAUTH: 'AUTH#auth.id',
      Member_SourceIdCOMMUNITY: 'COMMUNITY#community.id',
      'Member_SourceIdMICRO-COURSE': 'MICRO-COURSE#micro-course.id',

      Member_Status: member.status,
      Member_Name: member.name,
      Member_Email: member.email,
      Member_OrganisationName: member.organisationName,

      AccountOwner: member.accountOwner,
    };

    validMember = {
      ...member,
      sourceIds: [
        {
          id: 'crm.id',
          source: 'CRM',
        },
        {
          id: 'auth.id',
          source: 'AUTH',
        },
        {
          id: 'community.id',
          source: 'COMMUNITY',
        },
        {
          id: 'micro-course.id',
          source: 'MICRO-COURSE',
        },
      ],
    };
  });

  test('Successful preparation of domain model', ({ given, when, then }) => {
    let member: Member;

    given('I have a valid item', () => {
      // above
    });

    when('I prepare the domain model', async () => {
      member = DynamoDbMemberMapper.toDomain(validPersistenceItem);
    });

    then('I should receive a valid model', () => {
      expect(member).toMatchObject(validMember);
    });
  });
});
