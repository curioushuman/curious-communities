import {
  BasicServiceErrorFactory,
  ServiceErrorFactory,
} from '@curioushuman/error-factory';
import { OnModuleDestroy } from '@nestjs/common';

import { confirmEnvVars, dashToCamelCase } from '../../../utils/functions';
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
   * This will be in the same format as CDK i.e. cc-courses
   */
  private stackPrefix!: string;

  /**
   * We'll also include an errorFactory for this guy
   */
  protected errorFactory: ServiceErrorFactory;

  private prepareName(id: string): string {
    return dashToCamelCase(id);
  }

  private preparePrefix(stackId: string, prefix: string | undefined): void {
    const envPrefix = process.env.AWS_NAME_PREFIX || '';
    const prefixName = this.prepareName(prefix || envPrefix);
    const stackName = this.prepareName(stackId);
    this.stackPrefix = `${prefixName}${stackName}`;
  }

  constructor(props: AwsServiceProps) {
    const { stackId, prefix } = props;
    // set the resources, in order
    this.preparePrefix(stackId, prefix);

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
    awsService: AwsService
  ): (resourceId: string) => string {
    return (resourceId): string => {
      return `${awsService.stackPrefix}${awsService.prepareName(resourceId)}${
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
