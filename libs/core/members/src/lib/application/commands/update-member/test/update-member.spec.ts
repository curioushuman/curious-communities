import { NotFoundException } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  SourceInvalidError,
} from '@curioushuman/error-factory';
import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import {
  UpdateMemberCommand,
  UpdateMemberHandler,
} from '../update-member.command';
import { MemberRepository } from '../../../../adapter/ports/member.repository';
import { FakeMemberRepository } from '../../../../adapter/implementations/fake/fake.member.repository';
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
import { MemberBuilder } from '../../../../test/builders/member.builder';
import { UpdateMemberDto } from '../update-member.dto';
import { MemberSource } from '../../../../domain/entities/member-source';
import { MemberSourceBuilder } from '../../../../test/builders/member-source.builder';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./update-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeMemberRepository;
  let memberSourceRepository: FakeMemberSourceCrmRepository;
  let handler: UpdateMemberHandler;
  let updateMemberDto: UpdateMemberDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMemberHandler,
        LoggableLogger,
        { provide: MemberRepository, useClass: FakeMemberRepository },
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

    repository = moduleRef.get<MemberRepository>(
      MemberRepository
    ) as FakeMemberRepository;
    memberSourceRepository = moduleRef.get<MemberSourceCrmRepository>(
      MemberSourceCrmRepository
    ) as FakeMemberSourceCrmRepository;
    handler = moduleRef.get<UpdateMemberHandler>(UpdateMemberHandler);
  });

  test('Successfully updating a member', ({ given, and, when, then }) => {
    let updatedMemberSource: MemberSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      updateMemberDto = MemberBuilder().exists().buildUpdateMemberDto();
    });

    and('the returned source populates a valid member', async () => {
      // this is an updated version of the `exists()` memberSource
      updatedMemberSource = MemberSourceBuilder().updated().build();
      // save it to our fake repo, we know it is valid
      executeTask(memberSourceRepository.save(updatedMemberSource));
    });

    and('the source does exist in our DB', async () => {
      const members = await executeTask(repository.all());
      const memberBefore = members.find(
        (member) => member.sourceIds[0].id === updateMemberDto.id
      );
      expect(memberBefore).toBeDefined();
      if (memberBefore) {
        expect(memberBefore.status).not.toEqual(updatedMemberSource.status);
      }
    });

    when('I attempt to update a member', async () => {
      result = await handler.execute(new UpdateMemberCommand(updateMemberDto));
    });

    then('the related record should have been updated', async () => {
      const members = await executeTask(repository.all());
      const memberAfter = members.find(
        (member) => member.sourceIds[0].id === updateMemberDto.id
      );
      expect(memberAfter).toBeDefined();
      if (memberAfter) {
        expect(memberAfter.status).toEqual(updatedMemberSource.status);
      }
    });

    and('saved member is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let error: Error;

    given('no record exists that matches our request', () => {
      updateMemberDto = MemberBuilder()
        .noMatchingSource()
        .buildUpdateMemberDto();
    });

    when('I attempt to update a member', async () => {
      try {
        await handler.execute(new UpdateMemberCommand(updateMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; Member not found for ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      updateMemberDto = MemberBuilder().alpha().buildUpdateMemberDto();
    });

    and('the returned source populates a valid member', () => {
      // we know this to be true
    });

    and('the source does NOT exist in our DB', () => {
      // we know this to be true
    });

    when('I attempt to update a member', async () => {
      try {
        await handler.execute(new UpdateMemberCommand(updateMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; Source does not translate into a valid Member', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      updateMemberDto = MemberBuilder().invalidSource().buildUpdateMemberDto();
    });

    and('the returned source does not populate a valid Member', () => {
      // this occurs during
    });

    when('I attempt to update a member', async () => {
      try {
        await handler.execute(new UpdateMemberCommand(updateMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });

  test('Fail; Source is an invalid status to be updated in admin', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      // we know this
    });

    and('the returned source has an invalid status', () => {
      updateMemberDto = MemberBuilder().invalidStatus().buildUpdateMemberDto();
    });

    when('I attempt to update a member', async () => {
      try {
        await handler.execute(new UpdateMemberCommand(updateMemberDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
