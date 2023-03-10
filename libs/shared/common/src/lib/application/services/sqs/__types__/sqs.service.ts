import { SendMessageCommandInput } from '@aws-sdk/client-sqs';

export type SqsMessageBase = Omit<SendMessageCommandInput, 'QueueUrl'>;

/**
 * Props for sendMessageBatch
 */
export interface SqsSendMessageBatchProps<DomainMessage> {
  id: string;
  messages: DomainMessage[];
}
