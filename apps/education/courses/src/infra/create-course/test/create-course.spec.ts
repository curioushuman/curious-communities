import { HttpException } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { handler } from '../main';

/**
 * UNIT TEST
 * - we'll use mocks to unit test everything at local scope
 *
 * TODO
 * - [ ] this needs to be completed
 *
 * Relevant Jest notes (for mocking)
 * https://jestjs.io/docs/es6-class-mocks
 *
 * Scope
 * - validating the request (to the lambda)
 * - creating course
 * - returning response
 * - returning error
 */

const feature = loadFeature('./create-course.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  test('Fail; Invalid request', ({ given, when, then, and }) => {
    // disabled so we can pass an invalid request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dto: any;
    let error: HttpException;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let response: any;

    given('the request contains invalid data', () => {
      dto = {
        whatsThisParameter: 'ThisWontPassMuster',
      };
    });

    when('I attempt to create a course', async () => {
      try {
        response = await handler(dto);
        expect(response).toBeUndefined();
      } catch (err: unknown) {
        error = err as HttpException;
      }
    });

    then('I should receive an InternalRequestInvalidError', () => {
      expect(error.getStatus()).toBe(500);
      // this should match the regex you use in your API method integration response
      expect(error.message).toEqual(
        expect.stringMatching(/^Invalid internal communication/i)
      );
    });

    and('no result is returned', () => {
      expect(response).toBeUndefined();
    });
  });
});
