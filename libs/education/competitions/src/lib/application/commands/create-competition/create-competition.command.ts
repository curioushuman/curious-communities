import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import {
  ErrorFactory,
  RepositoryItemConflictError,
} from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CompetitionRepository } from '../../../adapter/ports/competition.repository';
import { CreateCompetitionDto } from './create-competition.dto';
import { CreateCompetitionMapper } from './create-competition.mapper';
import { CompetitionSourceRepository } from '../../../adapter/ports/competition-source.repository';
import { CompetitionSourceForCreate } from '../../../domain/entities/competition-source';

export class CreateCompetitionCommand implements ICommand {
  constructor(public readonly createCompetitionDto: CreateCompetitionDto) {}
}

/**
 * Command handler for create competition
 * TODO
 * - [ ] better associated competition check
 *       e.g. check against local IDs rather than just existence of competitionId
 */
@CommandHandler(CreateCompetitionCommand)
export class CreateCompetitionHandler
  implements ICommandHandler<CreateCompetitionCommand>
{
  constructor(
    private readonly competitionRepository: CompetitionRepository,
    private readonly competitionSourceRepository: CompetitionSourceRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateCompetitionHandler.name);
  }

  async execute(command: CreateCompetitionCommand): Promise<void> {
    const { createCompetitionDto } = command;

    const task = pipe(
      // #1. parse the dto
      createCompetitionDto,
      parseActionData(
        CreateCompetitionMapper.toFindCompetitionSourceDto,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. find the source
      TE.chain((findSourceDto) =>
        performAction(
          findSourceDto,
          this.competitionSourceRepository.findOne,
          this.errorFactory,
          this.logger,
          'find competition source'
        )
      ),

      // #3. parse the source
      TE.chain((competitionSource) =>
        sequenceT(TE.ApplySeq)(
          parseActionData(
            CompetitionSourceForCreate.check,
            this.logger,
            'SourceInvalidError'
          )(competitionSource),
          parseActionData(
            CreateCompetitionMapper.fromSourceToFindCompetitionDto,
            this.logger,
            'SourceInvalidError'
          )(competitionSource),
          parseActionData(
            CreateCompetitionMapper.fromSourceToCompetition,
            this.logger,
            'SourceInvalidError'
          )(competitionSource)
        )
      ),

      // #4. check for conflict
      TE.chain(([source, findCompetitionDto, competitionFromSource]) =>
        pipe(
          performAction(
            findCompetitionDto.value,
            this.competitionRepository.findById,
            this.errorFactory,
            this.logger,
            `check competition exists for source: ${source.id}`
          ),
          TE.chain((existingCompetition) => {
            throw new RepositoryItemConflictError(existingCompetition.name);
          }),
          TE.alt(() => TE.right(competitionFromSource))
        )
      ),

      // #5. create the competition, from the source
      TE.chain((competition) =>
        performAction(
          competition,
          this.competitionRepository.save,
          this.errorFactory,
          this.logger,
          `save competition from source`
        )
      )
    );

    return executeTask(task);
  }
}
