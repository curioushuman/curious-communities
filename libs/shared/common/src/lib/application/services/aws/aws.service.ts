import {
  BasicServiceErrorFactory,
  ServiceErrorFactory,
} from '@curioushuman/error-factory';
import { OnModuleDestroy } from '@nestjs/common';

import { confirmEnvVars, transformIdToName } from '../../../utils';
import { ResourceId } from '../../../utils/name/__types__';
import { AwsServiceProps } from './__types__';

/**
 * A service for engaging with Step Functions
 */
export abstract class AwsService implements OnModuleDestroy {
  /**
   * This must mirror what's in the CDK stack and cdk-utils
   */
  abstract awsResourceName: string;

  /**
   * The raw stack prefix and id for use later
   */
  protected stackId!: string;
  protected stackPrefix!: string;

  /**
   * This will be in the same format as CDK i.e. cc-courses
   */
  private stackPrefixName!: string;

  /**
   * We'll also include an errorFactory for this guy
   */
  protected errorFactory: ServiceErrorFactory;

  private preparePrefix(prefix: string | undefined): string {
    const envPrefix = process.env.AWS_NAME_PREFIX || '';
    return prefix || envPrefix;
  }

  private preparePrefixName(stackId?: string): string {
    const stackPrefix = transformIdToName(this.stackPrefix);
    const sId = stackId || this.stackId;
    const stackName = transformIdToName(sId);
    return `${stackPrefix}${stackName}`;
  }

  constructor(props: AwsServiceProps) {
    const { stackId, prefix } = props;
    this.stackId = stackId;
    this.stackPrefix = this.preparePrefix(prefix);
    // set the resources, in order
    this.stackPrefixName = this.preparePrefixName(stackId);

    // prepare the error factory
    this.errorFactory = new BasicServiceErrorFactory();
  }

  /**
   * A Nest.js lifecycle hook
   *
   * Based on the docs it looks like this hook will be called either
   * when the application is closed (app.close()) or when the application
   * receives a termination signal (SIGINT, SIGTERM, etc.)
   *
   * https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown
   *
   * TODO:
   * - [ ] is there a way to throw an error if the module does not include the
   *       correct listeners?
   */
  abstract onModuleDestroy(): void;

  protected prepareResourceName(
    awsService: AwsService,
    stackId?: ResourceId
  ): (resourceId: string) => string {
    const stackPrefixName = stackId
      ? awsService.preparePrefixName(stackId)
      : awsService.stackPrefixName;
    return (resourceId): string => {
      return `${stackPrefixName}${transformIdToName(resourceId)}${
        awsService.awsResourceName
      }`;
    };
  }

  protected prepareStateMachineArn(resourceName: string): string {
    confirmEnvVars(['AWS_REGION', 'AWS_ACCOUNT']);
    const region = process.env.AWS_REGION;
    const accountId = process.env.AWS_ACCOUNT;
    return `arn:aws:states:${region}:${accountId}:stateMachine:${resourceName}`;
  }
}
