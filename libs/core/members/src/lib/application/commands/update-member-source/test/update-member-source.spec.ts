import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  UpdateMemberSourceCommand,
  UpdateMemberSourceHandler,
} from '../update-member-source.command';
import {
  MemberSourceAuthRepository,
  MemberSourceCommunityRepository,
  MemberSourceCrmRepository,
  MemberSourceMicroCourseRepository,
} from '../../../../adapter/ports/member-source.repository';
import { FakeMemberSourceAuthRepository } from '../../../../adapter/implementations/fake/fake.member-source.auth.repository';
import { FakeMemberSourceCrmRepository } from '../../../../adapter/implementations/fake/fake.member-source.crm.repository';
import { FakeMemberSourceCommunityRepository } from '../../../../adapter/implementations/fake/fake.member-source.community.repository';
import { FakeMemberSourceMicroCourseRepository } from '../../../../adapter/implementations/fake/fake.member-source.micro-course.repository';
import { MemberSource } from '../../../../domain/entities/member-source';
import { MemberSourceBuilder } from '../../../../test/builders/member-source.builder';
import { UpdateMemberSourceDto } from '../update-member-source.dto';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-member-source.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeMemberSourceCrmRepository;
  let handler: UpdateMemberSourceHandler;
  let updateMemberSourceDto: UpdateMemberSourceDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMemberSourceHandler,
        LoggableLogger,
        {
          provide: MemberSourceCrmRepository,
          useClass: FakeMemberSourceCrmRepository,
        },
        {
          provide: MemberSourceAuthRepository,
          useClass: FakeMemberSourceAuthRepository,
        },
        {
          provide: MemberSourceCommunityRepository,
          useClass: FakeMemberSourceCommunityRepository,
        },
        {
          provide: MemberSourceMicroCourseRepository,
          useClass: FakeMemberSourceMicroCourseRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<MemberSourceCrmRepository>(
      MemberSourceCrmRepository
    ) as FakeMemberSourceCrmRepository;
    handler = moduleRef.get<UpdateMemberSourceHandler>(
      UpdateMemberSourceHandler
    );
  });

  test('Successfully updating a member source', ({
    given,
    and,
    when,
    then,
  }) => {
    let memberSourceBefore: MemberSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', async () => {
      // NOTE: this is the only time we skip the middle function
      // i.e. it is all handled in the builder
      updateMemberSourceDto =
        MemberSourceBuilder().buildUpdateMemberSourceDto();
      console.log('0', updateMemberSourceDto);
    });

    and('a matching record is found at the source', async () => {
      // we'll grab the memberSource before the update
      memberSourceBefore = await executeTask(
        repository.findOneById(updateMemberSourceDto.memberSource.id)
      );
    });

    when('I attempt to update a member source', async () => {
      result = await handler.execute(
        new UpdateMemberSourceCommand(updateMemberSourceDto)
      );
    });

    then('a record should have been updated', async () => {
      const memberSources = await executeTask(repository.all());
      const memberSourceAfter = memberSources.find(
        (memberSource) =>
          memberSource.id === updateMemberSourceDto.memberSource.id
      );
      expect(memberSourceAfter).toBeDefined();
      if (memberSourceAfter) {
        expect(memberSourceAfter.status).not.toEqual(memberSourceBefore.status);
      }
    });

    and('saved member source is returned', () => {
      expect(result.id).toEqual(updateMemberSourceDto.memberSource.id);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      // NOTE: this is the only time we skip the middle function
      // i.e. it is all handled in the builder
      updateMemberSourceDto =
        MemberSourceBuilder().buildInvalidUpdateMemberSourceDto();
    });

    when('I attempt to update a member source', async () => {
      try {
        await handler.execute(
          new UpdateMemberSourceCommand(updateMemberSourceDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
