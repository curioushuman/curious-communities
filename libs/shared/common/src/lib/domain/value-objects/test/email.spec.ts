import { Email } from '../email';

let input: string;
let result: boolean;
it('Should pass if provided valid email', () => {
  input = 'valid@email.com';
  result = false;
  if (Email.guard(input)) {
    result = true;
  }
  expect(result).toBe(true);
});

describe('When passed an email with basic invalidation issues, it should fail if', () => {
  it('is missing @ symbol', () => {
    input = 'invalid-email.com';
    result = false;
    if (Email.guard(input)) {
      result = true;
    }
    expect(result).toBe(false);
  });

  it('includes spaces', () => {
    input = 'invalid@ email.com';
    result = false;
    if (Email.guard(input)) {
      result = true;
    }
    expect(result).toBe(false);
  });

  it('is missing domain portion', () => {
    input = 'invalid@';
    result = false;
    if (Email.guard(input)) {
      result = true;
    }
    expect(result).toBe(false);
  });

  it('is missing name portion', () => {
    input = '@email.com';
    result = false;
    if (Email.guard(input)) {
      result = true;
    }
    expect(result).toBe(false);
  });
});
