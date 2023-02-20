import { INestApplication } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { RepositoryItemNotFoundError } from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { GroupModule } from '../../../test/group.module.fake';
import { GroupBuilder } from '../../../test/builders/group.builder';
import { GroupRepository } from '../../../adapter/ports/group.repository';
import { FakeGroupRepository } from '../../../adapter/implementations/fake/fake.group.repository';
import { UpdateGroupController } from '../update-group.controller';
import { UpdateGroupRequestDto } from '../dto/update-group.request.dto';

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
  let controller: UpdateGroupController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GroupModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    GroupModule.applyDefaults(app);
    repository = moduleRef.get<GroupRepository>(
      GroupRepository
    ) as FakeGroupRepository;
    controller = moduleRef.get<UpdateGroupController>(UpdateGroupController);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully updating a group', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateGroupDto: UpdateGroupRequestDto;
    let error: Error;

    given('the request is valid', async () => {
      updateGroupDto = GroupBuilder().updated().buildUpdateGroupRequestDto();
    });

    and('the group exists in the repository', async () => {
      const groups = await executeTask(repository.all());
      const groupBefore = groups.find(
        (group) => updateGroupDto.group.id === group.id
      );
      expect(groupBefore).toBeDefined();
      if (groupBefore) {
        expect(groupBefore.name).not.toEqual(updateGroupDto.group.name);
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
      'an existing record should have been updated in the repository',
      async () => {
        const groups = await executeTask(repository.all());
        const groupAfter = groups.find(
          (group) => updateGroupDto.group.id === group.id
        );
        expect(groupAfter).toBeDefined();
        if (groupAfter) {
          expect(groupAfter.name).toEqual(updateGroupDto.group.name);
        }
      }
    );

    and('saved group is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  // test('Fail; Group does not exist', ({ given, and, when, then }) => {
  //   let updateGroupDto: UpdateGroupRequestDto;
  //   let error: Error;

  //   given('the request is valid', () => {
  //     updateGroupDto = GroupBuilder()
  //       .doesntExist()
  //       .buildUpdateGroupRequestDto();
  //   });

  //   and('the group does not exist in the repository', () => {
  //     // above
  //   });

  //   when('I attempt to update a group', async () => {
  //     try {
  //       await controller.update(updateGroupDto);
  //     } catch (err) {
  //       error = err as Error;
  //     }
  //   });

  //   then('I should receive a RepositoryItemNotFoundError', () => {
  //     expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
  //   });
  // });

  // test('Fail; Invalid request', ({ given, when, then }) => {
  //   let updateGroupDto: UpdateGroupRequestDto;
  //   let error: Error;

  //   given('the request contains invalid data', () => {
  //     updateGroupDto = GroupBuilder()
  //       .invalid()
  //       .buildUpdateGroupRequestDto();
  //   });

  //   when('I attempt to create a group', async () => {
  //     try {
  //       await controller.update(updateGroupDto);
  //     } catch (err) {
  //       error = err as Error;
  //     }
  //   });

  //   then('I should receive a RequestInvalidError', () => {
  //     expect(error).toBeInstanceOf(RequestInvalidError);
  //   });
  // });
});
