import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FakeRepositoryErrorFactory,
  SourceInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  UpdateGroupCommand,
  UpdateGroupHandler,
} from '../update-group.command';
import { GroupRepository } from '../../../../adapter/ports/group.repository';
import { FakeGroupRepository } from '../../../../adapter/implementations/fake/fake.group.repository';
import { GroupSourceRepositoryReadWrite } from '../../../../adapter/ports/group-source.repository';
import { FakeGroupSourceRepository } from '../../../../adapter/implementations/fake/fake.group-source.repository';
import { GroupBuilder } from '../../../../test/builders/group.builder';
import { UpdateGroupDto } from '../update-group.dto';
import { GroupRepositoryErrorFactory } from '../../../../adapter/ports/group.repository.error-factory';
import { GroupSourceRepositoryErrorFactory } from '../../../../adapter/ports/group-source.repository.error-factory';
import { GroupSourceBuilder } from '../../../../test/builders/group-source.builder';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-group.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeGroupRepository;
  let handler: UpdateGroupHandler;
  let updateGroupDto: UpdateGroupDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateGroupHandler,
        LoggableLogger,
        { provide: GroupRepository, useClass: FakeGroupRepository },
        {
          provide: GroupSourceRepositoryReadWrite,
          useClass: FakeGroupSourceRepository,
        },
        {
          provide: GroupRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
        {
          provide: GroupSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<GroupRepository>(
      GroupRepository
    ) as FakeGroupRepository;
    handler = moduleRef.get<UpdateGroupHandler>(UpdateGroupHandler);
  });

  test('Successfully updating a group from course', ({
    given,
    and,
    when,
    then,
  }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      updateGroupDto = GroupBuilder().updated().buildUpdateCourseGroupDto();
    });

    and('the returned source populates a valid group', async () => {
      // above
    });

    and('the source does exist in our DB', async () => {
      const groups = await executeTask(repository.all());
      const groupBefore = groups.find(
        (group) => group.id === updateGroupDto.group.id
      );
      expect(groupBefore).toBeDefined();
      if (groupBefore) {
        expect(groupBefore.name).not.toEqual(updateGroupDto.course?.name);
      }
    });

    when('I attempt to update a group', async () => {
      try {
        result = await handler.execute(new UpdateGroupCommand(updateGroupDto));
      } catch (err) {
        expect(err).toBeUndefined();
      }
    });

    then(
      'the related record should have been updated in the repository',
      async () => {
        const groups = await executeTask(repository.all());
        const groupAfter = groups.find(
          (group) => group.id === updateGroupDto.group.id
        );
        expect(groupAfter).toBeDefined();
        if (groupAfter) {
          expect(groupAfter.name).toEqual(updateGroupDto.course?.name);
        }
      }
    );

    and('saved group is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  // test('Fail; Source does not translate into a valid Group', ({
  //   given,
  //   and,
  //   when,
  //   then,
  // }) => {
  //   let error: Error;

  //   given('a matching record is found at the source', () => {
  //     const groupSource = GroupSourceBuilder().invalid().buildNoCheck();
  //     updateGroupDto = GroupBuilder()
  //       .invalidSource()
  //       .buildUpdateGroupDto(groupSource);
  //   });

  //   and('the returned source does not populate a valid group', () => {
  //     // above
  //   });

  //   when('I attempt to update a group', async () => {
  //     try {
  //       await handler.execute(new UpdateGroupCommand(updateGroupDto));
  //     } catch (err) {
  //       error = err;
  //     }
  //   });

  //   then('I should receive a SourceInvalidError', () => {
  //     expect(error).toBeInstanceOf(SourceInvalidError);
  //   });
  // });
});
