import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { MemberSourceRepository } from '../../../adapter/ports/member-source.repository';
import { MemberSource } from '../../../domain/entities/member-source';
import { CreateMemberSourceDto } from './create-member-source.dto';
import { CreateMemberSourceMapper } from './create-member-source.mapper';
import { MemberSourceRepositoryErrorFactory } from '../../../adapter/ports/member-source.repository.error-factory';

export class CreateMemberSourceCommand implements ICommand {
  constructor(public readonly createMemberSourceDto: CreateMemberSourceDto) {}
}

/**
 * Command handler for create member source
 * TODO
 * - [ ] move the source repository selection to a separate service
 * - [ ] this shouldn't be accepting findDtos, doesn't feel right
 *       requires more thought. Look at upsert for example.
 */
@CommandHandler(CreateMemberSourceCommand)
export class CreateMemberSourceHandler
  implements ICommandHandler<CreateMemberSourceCommand>
{
  constructor(
    private readonly memberSourceRepository: MemberSourceRepository,
    private logger: LoggableLogger,
    private memberRepositoryErrorFactory: MemberSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(CreateMemberSourceHandler.name);
  }

  async execute(command: CreateMemberSourceCommand): Promise<MemberSource> {
    const { createMemberSourceDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      createMemberSourceDto,
      parseData(CreateMemberSourceDto.check, this.logger, 'RequestInvalidError')
    );

    const { member } = validDto;

    const task = pipe(
      member,
      // #2. populate member source
      parseActionData(
        CreateMemberSourceMapper.fromMemberToSource,
        this.logger,
        'RequestInvalidError'
      ),

      // #3. create the member source
      TE.chain((memberSourceForCreate) =>
        performAction(
          memberSourceForCreate,
          this.memberSourceRepository.create,
          this.memberRepositoryErrorFactory,
          this.logger,
          `save member source`
        )
      )
    );

    return executeTask(task);
  }
}
