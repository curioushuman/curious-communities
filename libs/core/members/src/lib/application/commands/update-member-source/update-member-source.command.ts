import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { MemberSourceRepositoryReadWrite } from '../../../adapter/ports/member-source.repository';
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
    private readonly memberSourceRepository: MemberSourceRepositoryReadWrite,
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
      parseData(
        UpdateMemberSourceMapper.fromMemberToSource(memberSource),
        this.logger,
        'SourceInvalidError'
      ),

      // #3. make sure an update is required
      parseData(
        UpdateMemberSourceMapper.requiresUpdate<MemberSource>(memberSource),
        this.logger,
        'SourceInvalidError'
      ),

      // #4. update the entity, from the source; if required
      O.fromNullable,
      O.fold(
        // if null, return the original member
        () => {
          this.logger.log(
            `MemberSource ${memberSource.id} does not need to be updated AT source`
          );
          return TE.right(memberSource);
        },
        // otherwise, update and return
        (ms) =>
          performAction(
            ms,
            this.memberSourceRepository.update,
            this.memberSourceErrorFactory,
            this.logger,
            `update source`
          )
      )
    );

    return executeTask(task);
  }
}
