import { createSlug } from '../slug';
import { Slug } from '../slug';

let slug: Slug;
it('Should be able to create a valid slug', () => {
  slug = createSlug('I want to be a dancer');
  expect(slug).toBe('i-want-to-be-a-dancer');
});

it('Should be able to parse out any non-slug-worthy characters', () => {
  slug = createSlug("P'i-k$%a-c^h*u&#@ r0o(c8k5s");
  expect(slug).toBe('pi-ka-chu-rocks');
});
