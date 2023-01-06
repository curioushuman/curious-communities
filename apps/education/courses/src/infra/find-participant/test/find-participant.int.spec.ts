import { HttpException } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { handler } from '../main';
import { FindParticipantRequestDto } from '../dto/request.dto';

/**
 * INTEGRATION TEST
 *
 * NOTE:
 * - we'll just test fail:validation as all we want to know is everything
 *   is communicating and doing as it should. Full coverage, of this sort,
 *   is handled in the tests within lower layers.
 * - when run locally the libs will be loaded by Nx so it's not a true
 *   integration test. But a useful step none the less.
 *
 * Scope
 * - handler and nest play nicely
 */

const feature = loadFeature('./find-participant.int.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  test('Fail; Invalid request', ({ given, when, then, and }) => {
    let error: HttpException;
    let dto: FindParticipantRequestDto;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let response: any;

    given('the request contains invalid data', () => {
      dto = {
        participantIdSourceValue: 'NotOk',
      };
    });

    when('I attempt to find a participant', async () => {
      try {
        response = await handler(dto);
      } catch (err: unknown) {
        error = err as HttpException;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error.getStatus()).toBe(400);
      expect(error.message).toEqual(expect.stringMatching(/^Invalid request/i));
    });

    and('no result is returned', () => {
      expect(response).toBeUndefined();
    });
  });
});
