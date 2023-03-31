import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

import {
  transformIdToResourceName,
  transformIdToResourceTitle,
} from '../utils/name';
import { ResourceId } from '../utils/name.types';

/**
 * QueueFrom construct
 *
 * This type of construct makes it simpler to use an existing
 * Queue without having to think too hard about it's ID.
 */
export class ChQueueFrom extends Construct {
  public id: ResourceId;
  public queue: sqs.IQueue;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    /**
     * This will check the id and prefix are the correct format
     * OR throw an error
     */
    this.id = ResourceId.check(id);

    const queueTitle = transformIdToResourceTitle(this.id, 'Queue');
    const queueArn = this.prepareArn(this.id);
    this.queue = sqs.Queue.fromQueueAttributes(this, queueTitle, {
      queueArn,
    });
  }

  private prepareArn(id: ResourceId) {
    const accountId =
      process.env.NODE_ENV === 'local'
        ? process.env.AWS_ACCOUNT_LOCAL
        : cdk.Aws.ACCOUNT_ID;
    const name = transformIdToResourceName(id, 'Queue');
    return `arn:aws:sqs:${cdk.Aws.REGION}:${accountId}:${name}`;
  }
}
