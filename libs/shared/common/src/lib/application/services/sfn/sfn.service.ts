import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { logAction } from '@curioushuman/fp-ts-utils';
import {
  SFNClient,
  StartExecutionCommand,
  StartExecutionCommandInput,
} from '@aws-sdk/client-sfn';

import { LoggableLogger } from '@curioushuman/loggable';

import { SfnStartExecutionProps } from './__types__/sfn.service';
import { AwsService } from '../aws/aws.service';
import { AwsServiceProps } from '../aws/__types__';

/**
 * A service for engaging with Step Functions
 */
@Injectable()
export class SfnService extends AwsService {
  private client: SFNClient;
  awsResourceName = 'SfnStateMachine';

  constructor(props: AwsServiceProps, private logger: LoggableLogger) {
    super(props);

    // prepare the clients
    this.client = new SFNClient({ region: process.env.CDK_DEPLOY_REGION });
  }

  /**
   * A Nest.js lifecycle hook; see AwsService for more info
   */
  onModuleDestroy() {
    this.client.destroy();
  }

  private prepareInput(input: Record<string, unknown> | undefined): string {
    return JSON.stringify(input || {});
  }

  /**
   * Actually execute the state machine
   */
  private tryStartExecution =
    (input: Record<string, unknown> | undefined) =>
    (stateMachineArn: string): TE.TaskEither<Error, void> => {
      return TE.tryCatch(
        async () => {
          const params: StartExecutionCommandInput = {
            input: this.prepareInput(input),
            stateMachineArn,
          };
          this.logger.debug
            ? this.logger.debug(params, 'SfnService.startExecution.params')
            : this.logger.log(params, 'SfnService.startExecution.params');
          const response = this.client.send(new StartExecutionCommand(params));
          this.logger.debug
            ? this.logger.debug(response, 'SfnService.startExecution.response')
            : this.logger.log(response, 'SfnService.startExecution.response');
        },
        // NOTE: we don't use an error factory here, it is one level up
        (reason: unknown) => reason as Error
      );
    };

  /**
   * API for starting execution of a state machine
   */
  public startExecution = (
    props: SfnStartExecutionProps
  ): TE.TaskEither<Error, void> => {
    return pipe(
      props.id,
      this.prepareResourceName,
      this.prepareStateMachineArn,
      this.tryStartExecution(props.input),
      logAction(
        this.logger,
        this.errorFactory,
        'successfully executed state machine',
        'failed to execute state machine'
      )
    );
  };
}
