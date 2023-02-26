import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import {
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
import { MemberBuilder } from '../../../../test/builders/member.builder';
import { UpdateMemberDto } from '../update-member.dto';
import { MemberSource } from '../../../../domain/entities/member-source';
import { MemberSourceBuilder } from '../../../../test/builders/member-source.builder';
import { MemberRepositoryErrorFactory } from '../../../../adapter/ports/member.repository.error-factory';
import { FakeMemberSourceRepository } from '../../../../adapter/implementations/fake/fake.member-source.repository';
import { MemberSourceRepositoryReadWrite } from '../../../../adapter/ports/member-source.repository';
import { MemberSourceRepositoryErrorFactory } from '../../../../adapter/ports/member-source.repository.error-factory';

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
  let handler: UpdateMemberHandler;
  let updateMemberDto: UpdateMemberDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMemberHandler,
        LoggableLogger,
        { provide: MemberRepository, useClass: FakeMemberRepository },
        {
          provide: MemberSourceRepositoryReadWrite,
          useClass: FakeMemberSourceRepository,
        },
        {
          provide: MemberRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
        {
          provide: MemberSourceRepositoryErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<MemberRepository>(
      MemberRepository
    ) as FakeMemberRepository;
    handler = moduleRef.get<UpdateMemberHandler>(UpdateMemberHandler);
  });

  test('Successfully updating a member', ({ given, and, when, then }) => {
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('the request is valid', () => {
      updateMemberDto = MemberBuilder().updated().buildUpdateMemberDto();
    });

    and('the source does exist in our DB', async () => {
      const members = await executeTask(repository.all());
      const memberBefore = members.find(
        (member) => member.id === updateMemberDto.member.id
      );
      expect(memberBefore).toBeDefined();
      if (memberBefore) {
        expect(memberBefore.name).not.toEqual(updateMemberDto.member.name);
      }
    });

    when('I attempt to update a member', async () => {
      result = await handler.execute(new UpdateMemberCommand(updateMemberDto));
    });

    then('the related record should have been updated', async () => {
      const members = await executeTask(repository.all());
      const memberAfter = members.find(
        (member) => member.id === updateMemberDto.member.id
      );
      expect(memberAfter).toBeDefined();
      if (memberAfter) {
        expect(memberAfter.name).toEqual(updateMemberDto.member.name);
      }
    });

    and('saved member is returned', () => {
      expect(result.id).toBeDefined();
    });
  });

  test('Successfully updating a member from source', ({
    given,
    and,
    when,
    then,
  }) => {
    let memberSource: MemberSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      memberSource = MemberSourceBuilder().updated().build();
      updateMemberDto = MemberBuilder()
        .updated()
        .buildUpdateFromSourceMemberDto(memberSource);
    });

    and('the returned source populates a valid member', async () => {
      // above
    });

    and('the source does exist in our DB', async () => {
      const members = await executeTask(repository.all());
      const memberBefore = members.find(
        (member) => member.sourceIds[0].id === memberSource.id
      );
      expect(memberBefore).toBeDefined();
      if (memberBefore) {
        expect(memberBefore.name).not.toEqual(memberSource.name);
      }
    });

    when('I attempt to update a member', async () => {
      result = await handler.execute(new UpdateMemberCommand(updateMemberDto));
    });

    then('the related record should have been updated', async () => {
      const members = await executeTask(repository.all());
      const memberAfter = members.find(
        (member) => member.sourceIds[0].id === memberSource.id
      );
      expect(memberAfter).toBeDefined();
      if (memberAfter) {
        expect(memberAfter.name).toEqual(memberSource.name);
      }
    });

    and('saved member is returned', () => {
      expect(result.id).toBeDefined();
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
      const memberSource = MemberSourceBuilder().invalidSource().buildNoCheck();
      updateMemberDto = MemberBuilder()
        .invalidSource()
        .buildUpdateFromSourceMemberDto(memberSource);
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
});
