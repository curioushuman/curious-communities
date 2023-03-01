import {
  participantDynamoDbItem,
  participantDomainItem,
} from '../../../../../../__fixtures__';
import { DynamoDbParticipantMapper } from '../participant.mapper';
import { Participant } from '../../../../domain/entities/participant';

/**
 * UNIT TEST
 * SUT = ParticipantMapper
 *
 * Scope
 * - mapping helper functions
 */

describe('ParticipantMapper', () => {
  test('when persistence item is valid, should convert into valid domain item', () => {
    const domainItem = DynamoDbParticipantMapper.toDomain(
      participantDynamoDbItem
    );
    expect(domainItem).toMatchObject(participantDomainItem);
  });
  test('when domain item is valid, should convert into valid persistence item', () => {
    const persistenceItem = DynamoDbParticipantMapper.toPersistence(
      Participant.check(participantDomainItem)
    );
    expect(persistenceItem).toMatchObject(participantDynamoDbItem);
  });
});
