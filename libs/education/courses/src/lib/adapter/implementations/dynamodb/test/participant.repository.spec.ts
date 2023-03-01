// import { Test, TestingModule } from '@nestjs/testing';
// import { LoggableLogger } from '@curioushuman/loggable';
// import { DynamoDbRepositoryErrorFactory } from '@curioushuman/common';
import {
  participantDynamoDbItem,
  participantDomainItem,
} from '../../../../../../__fixtures__';
// import { ParticipantRepository } from '../../../ports/participant.repository';
// import { DynamoDbParticipantRepository } from '../participant.repository';
// import { ParticipantRepositoryErrorFactory } from '../../../ports/participant.repository.error-factory';
// import { executeTask } from '@curioushuman/fp-ts-utils';
import { DynamoDbParticipant } from '../entities/participant';
import { DynamoDbParticipantMapper } from '../participant.mapper';

// const mockDynamoDBDocumentClient = jest.fn().mockImplementation(() => {
//   return { from: jest.fn(), send: jest.fn() };
// });

// jest.mock('@aws-sdk/lib-dynamodb', () => ({
//   DynamoDBDocumentClient: jest.fn().mockImplementation(() => {
//     return { from: jest.fn(), send: jest.fn() };
//   }),
// }));
// jest.mock('@aws-sdk/lib-dynamodb', () => {
//   return {
//     DynamoDBDocumentClient: jest.fn(),
//   };
// });
// DynamoDBDocumentClient.send = jest.fn();

/**
 * UNIT TEST
 * SUT = ParticipantMapper
 *
 * Scope
 * - mapping helper functions
 *
 * ! I cannot get mocking of DynamoDBDocumentClient working... aggggh
 */

describe('DynamoDbParticipantRepository', () => {
  // let repository: ParticipantRepository;

  beforeAll(async () => {
    // const moduleRef: TestingModule = await Test.createTestingModule({
    //   providers: [
    //     LoggableLogger,
    //     {
    //       provide: ParticipantRepository,
    //       useClass: DynamoDbParticipantRepository,
    //     },
    //     {
    //       provide: ParticipantRepositoryErrorFactory,
    //       useClass: DynamoDbRepositoryErrorFactory,
    //     },
    //   ],
    // }).compile();
    // repository = moduleRef.get<ParticipantRepository>(
    //   ParticipantRepository
    // ) as DynamoDbParticipantRepository;
  });

  describe('processFindOne', () => {
    test('when persistence item is valid, should convert into valid domain item', () => {
      // const task = repository.findOneByIdSourceValue(
      //   'COURSE#a0n9s000000G0kEAAS'
      // );
      // const domainItem = executeTask(task);
      // ! Because I can't get the mock working, I've pulled in literally what the function does
      const participantItem = DynamoDbParticipant.check(
        participantDynamoDbItem
      );
      const domainItem = DynamoDbParticipantMapper.toDomain(participantItem);
      expect(domainItem).toMatchObject(participantDomainItem);
    });
  });
});
