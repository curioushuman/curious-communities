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

import { MemberModule } from '../../../test/member.module.fake';
import { UpdateMemberModule } from '../../../update-member.module';
import { UpdateMemberRequestDto } from '../dto/update-member.request.dto';
import { MemberBuilder } from '../../../test/builders/member.builder';
import { UpdateMemberController } from '../../../infra/update-member/update-member.controller';
import { FakeMemberRepository } from '../../../adapter/implementations/fake/fake.member.repository';
import { MemberRepository } from '../../../adapter/ports/member.repository';
import { MemberSourceBuilder } from '../../../test/builders/member-source.builder';
import { MemberSource } from '../../../domain/entities/member-source';
import { MemberSourceRepository } from '../../../adapter/ports/member-source.repository';
import { FakeMemberSourceRepository } from '../../../adapter/implementations/fake/fake.member-source.repository';

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

const feature = loadFeature('./update-member.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeMemberRepository;
  let memberSourcerepository: FakeMemberSourceRepository;
  let controller: UpdateMemberController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    UpdateMemberModule.applyDefaults(app);
    repository = moduleRef.get<MemberRepository>(
      MemberRepository
    ) as FakeMemberRepository;
    memberSourcerepository = moduleRef.get<MemberSourceRepository>(
      MemberSourceRepository
    ) as FakeMemberSourceRepository;
    controller = moduleRef.get<UpdateMemberController>(UpdateMemberController);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully updating a member', ({ given, and, when, then }) => {
    let updatedMemberSource: MemberSource;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    let updateMemberDto: UpdateMemberRequestDto;
    let error: Error;

    given('the request is valid', () => {
      // we know this to exist in our fake repo
      updateMemberDto = MemberBuilder().exists().buildUpdateMemberRequestDto();
    });

    and('a matching record is found at the source', async () => {
      updatedMemberSource = MemberSourceBuilder().updated().build();
      // save it to our fake repo
      executeTask(memberSourcerepository.save(updatedMemberSource));
      const members = await executeTask(repository.all());
      const memberBefore = members.find(
        (member) => member.externalId === updateMemberDto.externalId
      );
      expect(memberBefore).toBeDefined();
      if (memberBefore) {
        expect(memberBefore.name).not.toEqual(updatedMemberSource.name);
      }
    });

    when('I attempt to update a member', async () => {
      try {
        result = await controller.update(updateMemberDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then(
      'the related record should have been updated in the repository',
      async () => {
        const members = await executeTask(repository.all());
        const memberAfter = members.find(
          (member) => member.externalId === updateMemberDto.externalId
        );
        expect(memberAfter).toBeDefined();
        if (memberAfter) {
          expect(memberAfter.name).toEqual(updatedMemberSource.name);
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
    let updateMemberDto: UpdateMemberRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      // we know this to exist in our fake repo
      updateMemberDto = MemberBuilder().invalid().buildUpdateMemberRequestDto();
    });

    when('I attempt to update a member', async () => {
      try {
        result = await controller.update(updateMemberDto);
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
