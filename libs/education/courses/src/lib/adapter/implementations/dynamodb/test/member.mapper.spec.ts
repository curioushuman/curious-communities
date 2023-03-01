import {
  participantDynamoDbItem,
  memberDomainItem,
} from '../../../../../../__fixtures__';
import { DynamoDbMemberMapper } from '../member.mapper';

/**
 * UNIT TEST
 * SUT = MemberMapper
 *
 * Scope
 * - mapping helper functions
 */

describe('MemberMapper', () => {
  test('when persistence item is valid, should convert into valid domain item', () => {
    const domainItem = DynamoDbMemberMapper.toDomain(participantDynamoDbItem);
    expect(domainItem).toMatchObject(memberDomainItem);
  });
});
