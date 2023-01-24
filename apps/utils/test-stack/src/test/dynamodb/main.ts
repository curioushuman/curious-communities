/**
 * This function essentially does nothing.
 *
 * Externally to this, we're going to add an SQS destination to this lambda.
 * As all we're using it for is to test that DynamoDb records have been created.
 */
export const handler = (event: any): void => {
  // just pass it on
  return event;
};
