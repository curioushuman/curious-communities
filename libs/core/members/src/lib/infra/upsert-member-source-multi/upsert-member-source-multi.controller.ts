import { Controller } from '@nestjs/common';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';
import { UpsertMemberSourceMultiRequestDto } from './dto/upsert-member-source-multi.request.dto';
import config from '../../static/config';
import { Source } from '../../domain/value-objects/source';
import { MemberResponseDto } from '../dto/member.response.dto';
import { UpsertMemberSourceRequestDto } from '../upsert-member-source/dto/upsert-member-source.request.dto';
import { MemberSourceQueueService } from '../../adapter/ports/member-source.queue-service';

/**
 * Controller to handle upserting multiple member sources
 *
 * NOTES:
 * - I'm directly injecting an SQS queue service.
 *   If at some later point we would like to offer multiple queue services
 *   we could create a queue service interface and inject that instead.
 */
@Controller()
export class UpsertMemberSourceMultiController {
  constructor(
    private logger: LoggableLogger,
    private queueService: MemberSourceQueueService
  ) {
    this.logger.setContext(UpsertMemberSourceMultiController.name);
  }

  /**
   * Find the list of sources for this micro-service
   *
   * NOTES:
   * - later you could modify this function to obtain sources from DB
   */
  private findSources(): Source[] {
    return config.defaults.accountDestinations.map(Source.check);
  }

  private prepareUpsertDto(
    member: MemberResponseDto,
    source: Source
  ): UpsertMemberSourceRequestDto {
    return {
      source,
      member,
    };
  }

  private prepareMessages =
    (sources: Source[]) =>
    (member: MemberResponseDto): UpsertMemberSourceRequestDto[] => {
      return sources.map((source) => this.prepareUpsertDto(member, source));
    };

  public async upsert(
    requestDto: UpsertMemberSourceMultiRequestDto
  ): Promise<void> {
    // #1. find the sources
    const sources = this.findSources();

    // #2. validate the dto
    const task = pipe(
      requestDto,
      parseData(UpsertMemberSourceMultiRequestDto.check, this.logger),
      (validDto) => validDto.member,
      this.prepareMessages(sources),
      this.queueService.upsertMembers
    );

    return executeTask(task);
  }
}
