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
import { MutateMemberModule } from '../../../mutate-member.module';
import { UpdateMemberRequestDto } from '../dto/update-member.request.dto';
import { MemberBuilder } from '../../../test/builders/member.builder';
import { UpdateMemberController } from '../update-member.controller';
import { FakeMemberRepository } from '../../../adapter/implementations/fake/fake.member.repository';
import { MemberRepository } from '../../../adapter/ports/member.repository';
import { MemberSourceBuilder } from '../../../test/builders/member-source.builder';
import { MemberSource } from '../../../domain/entities/member-source';
import { MemberSourceCrmRepository } from '../../../adapter/ports/member-source.repository';
import { FakeMemberSourceCrmRepository } from '../../../adapter/implementations/fake/fake.member-source.crm.repository';
import { prepareExternalIdSourceValue } from '@curioushuman/common';

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
  let memberSourcerepository: FakeMemberSourceCrmRepository;
  let controller: UpdateMemberController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MemberModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    MutateMemberModule.applyDefaults(app);
    repository = moduleRef.get<MemberRepository>(
      MemberRepository
    ) as FakeMemberRepository;
    memberSourcerepository = moduleRef.get<MemberSourceCrmRepository>(
      MemberSourceCrmRepository
    ) as FakeMemberSourceCrmRepository;
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
        (member) =>
          updateMemberDto.idSourceValue ===
          prepareExternalIdSourceValue(
            member.sourceIds[0].id,
            member.sourceIds[0].source
          )
      );
      expect(memberBefore).toBeDefined();
      if (memberBefore) {
        expect(memberBefore.status).not.toEqual(updatedMemberSource.status);
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

    then('the related record should have been updated', async () => {
      const members = await executeTask(repository.all());
      const memberAfter = members.find(
        (member) =>
          updateMemberDto.idSourceValue ===
          prepareExternalIdSourceValue(
            member.sourceIds[0].id,
            member.sourceIds[0].source
          )
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
