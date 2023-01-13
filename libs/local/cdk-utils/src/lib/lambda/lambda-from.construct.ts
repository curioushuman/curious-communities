import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import {
  transformIdToResourceName,
  transformIdToResourceTitle,
} from '../utils/name';
import { ResourceId } from '../utils/name.types';

/**
 * LambdaFrom construct
 *
 * This type of construct makes it simpler to use an existing
 * Lambda without having to think too hard about it's ID.
 */
export class ChLambdaFrom extends Construct {
  public id: ResourceId;
  public lambdaFunction: lambda.IFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    /**
     * This will check the id and prefix are the correct format
     * OR throw an error
     */
    this.id = ResourceId.check(id);

    const lambdaTitle = transformIdToResourceTitle(this.id, 'Lambda');
    const lambdaArn = this.prepareArn(this.id);
    this.lambdaFunction = lambda.Function.fromFunctionArn(
      this,
      lambdaTitle,
      lambdaArn
    );
  }

  private prepareArn(id: ResourceId) {
    const accountId =
      process.env.NODE_ENV === 'local'
        ? process.env.AWS_ACCOUNT_LOCAL
        : cdk.Aws.ACCOUNT_ID;
    const name = transformIdToResourceName(id, 'Lambda');
    return `arn:aws:lambda:${cdk.Aws.REGION}:${accountId}:function:${name}`;
  }
}
