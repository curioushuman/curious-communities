import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import {
  //   ErrorFactory,
  //   FakeRepositoryErrorFactory,
  //   RepositoryItemConflictError,
  //   SourceInvalidError,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { GroupModule } from '../../../test/group.module.fake';
import { UpdateGroupModule } from '../../../update-group.module';
import { UpdateGroupRequestDto } from '../dto/update-group.request.dto';
import { GroupBuilder } from '../../../test/builders/group.builder';
import { UpdateGroupController } from '../../../infra/update-group/update-group.controller';
import { FakeGroupRepository } from '../../../adapter/implementations/fake/fake.group.repository';
import { GroupRepository } from '../../../adapter/ports/group.repository';
import { GroupSourceBuilder } from '../../../test/builders/group-source.builder';
import { GroupSource } from '../../../domain/entities/group-source';
import { GroupSourceRepository } from '../../../adapter/ports/group-source.repository';
import { FakeGroupSourceRepository } from '../../../adapter/implementations/fake/fake.group-source.repository';

/**
 * INTEGRATION TEST
 * SUT = the controller, the command handler
 *
 * NOTES:
 * - the controller does so little, so rather than create a separate unit test
 *  for it, we'll just test it here
 *
 * TODO
 * - [ ] need to mock an error for internal error testing
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeGroupRepository;
  let groupSourcerepository: FakeGroupSourceRepository;
  let controller: UpdateGroupController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    UpdateGroupModule.applyDefaults(app);
    repository = moduleRef.get<GroupRepository>(
      GroupRepository
    ) as FakeGroupRepository;
    groupSourcerepository = moduleRef.get<GroupSourceRepository>(
      GroupSourceRepository
    ) as FakeGroupSourceRepository;
    controller = moduleRef.get<UpdateGroupController>(UpdateGroupController);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully updating a group', ({ given, and, when, then }) => {
    let updatedGroupSource: GroupSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateGroupDto: UpdateGroupRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      updateGroupDto = GroupBuilder().exists().buildUpdateGroupRequestDto();
    });

    and('a matching record is found at the source', async () => {
      updatedGroupSource = GroupSourceBuilder().updated().build();
      // save it to our fake repo
      executeTask(groupSourcerepository.save(updatedGroupSource));
      const groups = await executeTask(repository.all());
      const groupBefore = groups.find(
        (group) => group.id === updateGroupDto.id
      );
      expect(groupBefore).toBeDefined();
      if (groupBefore) {
        expect(groupBefore.name).not.toEqual(updatedGroupSource.name);
      }
    });

    when('I attempt to update a group', async () => {
      try {
        result = await controller.update(updateGroupDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'the related record should have been updated in the repository',
      async () => {
        const groups = await executeTask(repository.all());
        const groupAfter = groups.find(
          (group) => group.id === updateGroupDto.id
        );
        expect(groupAfter).toBeDefined();
        if (groupAfter) {
          expect(groupAfter.name).toEqual(updatedGroupSource.name);
        }
      }
    );

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });

  test('Fail; Invalid request', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateGroupDto: UpdateGroupRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      updateGroupDto = GroupBuilder().invalid().buildUpdateGroupRequestDto();
    });

    when('I attempt to update a group', async () => {
      try {
        result = await controller.update(updateGroupDto);
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });
});