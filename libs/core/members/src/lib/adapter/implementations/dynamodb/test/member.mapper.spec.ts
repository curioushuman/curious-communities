import { loadFeature, defineFeature } from 'jest-cucumber';

import { DynamoDbMemberMapper } from '../member.mapper';
import { MembersDynamoDbItem } from '../entities/item';
import { Member } from '../../../../domain/entities/member';
import { MemberBuilder } from '../../../../test/builders/member.builder';
import {
  DynamoDbMemberAttributes,
  DynamoDbMemberKeys,
} from '../entities/member';

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
  let validPersistenceAttributes: DynamoDbMemberAttributes;
  let validMember: Member;

  beforeAll(() => {
    const member = MemberBuilder().build();
    validPersistenceItem = {
      primaryKey: member.id,
      sortKey: member.id,
      Member_Id: member.id,
      Member_Source_Origin: 'CRM',
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
      Sk_Member_Email: validPersistenceItem.primaryKey as string,
      Sk_Member_SourceIdCRM: validPersistenceItem.primaryKey as string,
      Sk_Member_SourceIdAUTH: validPersistenceItem.primaryKey as string,
      Sk_Member_SourceIdCOMMUNITY: validPersistenceItem.primaryKey as string,
      'Sk_Member_SourceIdMICRO-COURSE':
        validPersistenceItem.primaryKey as string,
    };

    validPersistenceAttributes = {
      Member_Id: validPersistenceItem.Member_Id as string,
      Member_Status: validPersistenceItem.Member_Status as string,
      Member_Name: validPersistenceItem.Member_Name as string,
      Member_Email: validPersistenceItem.Member_Email as string,
      Member_OrganisationName:
        validPersistenceItem.Member_OrganisationName as string,
      AccountOwner: validPersistenceItem.AccountOwner as string,
      Member_SourceIdCRM: validPersistenceItem.Member_SourceIdCRM as string,
      Member_SourceIdAUTH: validPersistenceItem.Member_SourceIdAUTH as string,
      Member_SourceIdCOMMUNITY:
        validPersistenceItem.Member_SourceIdCOMMUNITY as string,
      'Member_SourceIdMICRO-COURSE': validPersistenceItem[
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

    when('I prepare the persistence keys', async () => {
      keys = DynamoDbMemberMapper.toPersistenceKeys(validMember);
    });

    then('I should receive a valid keys model', () => {
      expect(keys).toMatchObject(validPersistenceKeys);
    });
  });

  test('Successful preparation of persistence attributes', ({
    given,
    when,
    then,
  }) => {
    let attributes: DynamoDbMemberAttributes;

    given('I have an entity with valid source ids', () => {
      // above
    });

    when('I prepare the persistence attributes', async () => {
      attributes = DynamoDbMemberMapper.toPersistenceAttributes(validMember);
    });

    then('I should receive a valid attributes model', () => {
      expect(attributes).toMatchObject(validPersistenceAttributes);
    });
  });
});
