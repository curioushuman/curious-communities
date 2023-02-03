import { SendMessageCommandInput } from '@aws-sdk/client-sqs';

/**
 * Props for DynamoDbRepository
 */
export interface SqsServiceProps {
  queueId: string;
  prefix?: string;
}

export type SqsMessageBase = Omit<SendMessageCommandInput, 'QueueUrl'>;
