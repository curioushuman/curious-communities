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
import { UpdateMemberSourceDto } from './update-member-source.dto';
import { UpdateMemberSourceMapper } from './update-member-source.mapper';
import { MemberSourceRepositoryErrorFactory } from '../../../adapter/ports/member-source.repository.error-factory';

export class UpdateMemberSourceCommand implements ICommand {
  constructor(public readonly updateMemberSourceDto: UpdateMemberSourceDto) {}
}

/**
 * Command handler for update member source
 * TODO
 * - [ ] move the source repository selection to a separate service
 * - [ ] this shouldn't be accepting findDtos, doesn't feel right
 *       requires more thought. Look at upsert for example.
 */
@CommandHandler(UpdateMemberSourceCommand)
export class UpdateMemberSourceHandler
  implements ICommandHandler<UpdateMemberSourceCommand>
{
  constructor(
    private readonly memberSourceRepository: MemberSourceRepository,
    private logger: LoggableLogger,
    private memberSourceErrorFactory: MemberSourceRepositoryErrorFactory
  ) {
    this.logger.setContext(UpdateMemberSourceHandler.name);
  }

  async execute(command: UpdateMemberSourceCommand): Promise<MemberSource> {
    const { updateMemberSourceDto } = command;

    // #1. validate the dto
    const validDto = pipe(
      updateMemberSourceDto,
      parseData(UpdateMemberSourceDto.check, this.logger, 'RequestInvalidError')
    );

    const { member, memberSource } = validDto;

    const task = pipe(
      member,

      // #2. prepare the updated member source
      parseActionData(
        UpdateMemberSourceMapper.fromMemberToSource(memberSource),
        this.logger,
        'SourceInvalidError'
      ),

      // #3. update the member source
      TE.chain((ms) =>
        performAction(
          ms,
          this.memberSourceRepository.update,
          this.memberSourceErrorFactory,
          this.logger,
          `update member source`
        )
      )
    );

    return executeTask(task);
  }
}
