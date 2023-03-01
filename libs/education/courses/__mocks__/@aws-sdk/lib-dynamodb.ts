import { participantDynamoDbItem } from '../../__fixtures__';

/**
 * A Mock of the DynamoDBDocumentClient class
 *
 * ! CANNOT get it to work
 * - it loads fine
 * - gets stuck on .from not being a function
 *
 * Just need some more time (I don't have) with it
 */
export const participant = jest
  .fn()
  .mockReturnValue(Promise.resolve(participantDynamoDbItem));

const sendFn = jest.fn().mockImplementation(() => ({ Item: participant }));

class DocClient {
  send = sendFn;
}

const fromFn = jest.fn().mockImplementation(() => DocClient);

export class DynamoDBDocumentClient {
  from = fromFn;
}
