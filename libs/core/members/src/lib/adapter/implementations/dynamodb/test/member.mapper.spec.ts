import { loadFeature, defineFeature } from 'jest-cucumber';

import { DynamoDbMemberMapper } from '../member.mapper';
import { MembersDynamoDbItem } from '../entities/item';
import { Member } from '../../../../domain/entities/member';
import { MemberBuilder } from '../../../../test/builders/member.builder';
import { DynamoDbMemberKeys } from '../entities/member';

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
  let validPersistenceKeys: DynamoDbMemberKeys;
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

    validPersistenceKeys = {
      primaryKey: validPersistenceItem.primaryKey,
      sortKey: validPersistenceItem.sortKey,
      Sk_Member_Email: validPersistenceItem.Member_Email as string,
      Sk_Member_SourceIdCRM: validPersistenceItem.Member_SourceIdCRM as string,
      Sk_Member_SourceIdAUTH:
        validPersistenceItem.Member_SourceIdAUTH as string,
      Sk_Member_SourceIdCOMMUNITY:
        validPersistenceItem.Member_SourceIdCOMMUNITY as string,
      'Sk_Member_SourceIdMICRO-COURSE': validPersistenceItem[
        'Member_SourceIdMICRO-COURSE'
      ] as string,
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

  test('Successful preparation of persistence keys', ({
    given,
    when,
    then,
  }) => {
    let keys: DynamoDbMemberKeys;

    given('I have an entity with valid source ids', () => {
      // above
    });

    when('I prepare the persistence source keys', async () => {
      keys = DynamoDbMemberMapper.toPersistenceKeys(validMember);
    });

    then('I should receive a valid keys model', () => {
      expect(keys).toMatchObject(validPersistenceKeys);
    });
  });
});
