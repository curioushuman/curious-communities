import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  executeTask,
  parseActionData,
  parseData,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';
import { RequestSourceEnum } from '@curioushuman/common';

import { ParticipantMessagingService } from '../../adapter/ports/participant.messaging-service';
import { UpdateParticipantMultiRequestDto } from './dto/update-participant-multi.request.dto';
import { Participant } from '../../domain/entities/participant';
import { FindParticipantsMapper } from '../../application/queries/find-participants/find-participants.mapper';
import { FindParticipantsQuery } from '../../application/queries/find-participants/find-participants.query';
import { UpdateParticipantRequestDto } from '../update-participant/dto/update-participant.request.dto';
import { ParticipantMapper } from '../participant.mapper';
import { MemberDto } from '../dto/member.dto';
import { MemberMapper } from '../member.mapper';
import {
  ParticipantBaseResponseDto,
  ParticipantResponseDto,
} from '../dto/participant.response.dto';
import { CourseBaseResponseDto } from '../dto/course.response.dto';
import { CourseMapper } from '../course.mapper';

/**
 * Controller to handle updating multiple participants
 *
 * TODO:
 * - [ ] whole thing could be done in fp-ts
 */
@Controller()
export class UpdateParticipantMultiController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus,
    private messagingService: ParticipantMessagingService
  ) {
    this.logger.setContext(UpdateParticipantMultiController.name);
  }

  /**
   * Updates a participant with the new course data
   * NOTE: we do not update individual fields here, this is used
   * when the course changes, and we want to update all the members
   * with the new course data
   */
  private prepareCourseUpdateDto(
    participant: Participant,
    course: CourseBaseResponseDto | undefined
  ): CourseBaseResponseDto {
    if (!course) {
      return CourseMapper.toBaseResponseDto(participant.course);
    }
    return course;
  }

  /**
   * Updates a participant with new member data
   * NOTE: similarly we are not picking out individual fields
   * at this time.
   */
  private prepareMemberUpdateDto(
    participant: Participant,
    member: MemberDto | undefined
  ): MemberDto {
    if (!member) {
      return MemberMapper.toResponseDto(participant.member);
    }
    return member;
  }

  /**
   * Updates a participant with the mass update
   * OR just passes the participant through if no mass update
   *
   * ! NOTE: we haven't yet implemented this, as we don't yet have a use case
   */
  private prepareParticipantUpdateDto(
    participant: Participant,
    // we'll implement this later
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: ParticipantResponseDto | undefined
  ): ParticipantBaseResponseDto {
    return ParticipantMapper.toBaseResponseDto(participant);
    // if (!updatedParticipant) {
    //   return ParticipantMapper.toResponseDto(participant);
    // }
    // const participantForUpdate = {
    //   ...participant,
    // };
    // // overwrite the current data, with the mass update data
    // for (const [key, value] of Object.entries(ParticipantForMultiUpdate)) {
    //   const participantForUpdateKey = key as keyof ParticipantForMultiUpdate;
    //   if (participant) {
    //     participantForUpdate[participantForUpdateKey] = value.check(
    //       participant[participantForUpdateKey]
    //     );
    //   }
    // }
    // return ParticipantMapper.toBaseResponseDto(participantForUpdate);
  }

  private prepareUpdateDto(
    participant: Participant,
    validDto: UpdateParticipantMultiRequestDto
  ): UpdateParticipantRequestDto {
    const participantBase = this.prepareParticipantUpdateDto(
      participant,
      validDto.participant
    );
    const member = this.prepareMemberUpdateDto(participant, validDto.member);
    const course = this.prepareCourseUpdateDto(participant, validDto.course);
    return {
      participant: {
        ...participantBase,
        member,
        course,
      },
      requestSource: RequestSourceEnum.INTERNAL,
    };
  }

  private prepareMessages =
    (participants: Participant[]) =>
    (
      validDto: UpdateParticipantMultiRequestDto
    ): UpdateParticipantRequestDto[] => {
      return participants.map((participant) =>
        this.prepareUpdateDto(participant, validDto)
      );
    };

  public async update(
    requestDto: UpdateParticipantMultiRequestDto
  ): Promise<void> {
    // #1. validate dto
    const validDto = pipe(
      requestDto,
      parseData(UpdateParticipantMultiRequestDto.check, this.logger)
    );

    // #2. find the participants
    const participants = await this.findParticipants(validDto);

    const task = pipe(
      validDto,
      // #3. prepare the messages
      this.prepareMessages(participants),
      // #4. send the messages
      this.messagingService.sendMessageBatch
    );

    return executeTask(task);
  }

  private findParticipants(
    validDto: UpdateParticipantMultiRequestDto
  ): Promise<Participant[]> {
    const task = pipe(
      validDto,

      // #1. transform dto
      parseActionData(
        FindParticipantsMapper.fromUpdateParticipantMultiRequestDto,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. call the query
      TE.chain((findDto) =>
        pipe(
          TE.tryCatch(
            async () => {
              const query = new FindParticipantsQuery(findDto);
              return await this.queryBus.execute<FindParticipantsQuery>(query);
            },
            (error: unknown) => error as Error
          )
        )
      )
    );

    return executeTask(task);
  }
}
