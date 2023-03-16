import { Record, Static, String } from 'runtypes';

/**
 * Common Keys for the all items
 */
export const DynamoDbItemKeys = Record({
  partitionKey: String,
  sortKey: String,
});

/**
 * Keys for the item
 */
export type DynamoDbItemKeys = Static<typeof DynamoDbItemKeys>;

/**
 * Complete item that is returned from the DynamoDb query
 *
 * Each record will have participant, and course information.
 * Throw allllll the attributes in.
 * Omitting any that may double up.
 *
 * TODO: there is probably a more elegant way of doing this.
 */
export type DynamoDbItem<T> = DynamoDbItemKeys & T;

/**
 * Discriminating type to help separation of rows from DDB query
 */
export type DynamoDbDiscriminatedItem<T> = DynamoDbItem<T> & {
  entityType: string;
};
