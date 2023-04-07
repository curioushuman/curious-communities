import { SendMessageCommandInput } from '@aws-sdk/client-sqs';
import { SqsSfnProxyRequestDto } from '../../../../infra/__types__';

export type SqsMessageBase = Omit<SendMessageCommandInput, 'QueueUrl'>;

export type SqsQueueType = 'standard' | 'throttled' | 'throttled-destinations';

/**
 * Props for sendMessageBatch
 */
export interface SqsSendMessageBatchProps<DomainMessage> {
  id: string;
  messages: DomainMessage[];
  queueType?: SqsQueueType;
}

/**
 * The SQS service can support either the raw message type
 * OR one wrapped in an SQS to SFN proxy wrapper
 */
export type SqsMsgOrProxyMsg<DomainMessage> =
  | DomainMessage
  | SqsSfnProxyRequestDto<DomainMessage>;

/**
 * Props for trySendMessageBatch
 */
export interface SqsTrySendMessageBatchProps {
  queueUrl: string;
  messages: SqsMessageBase[];
}
