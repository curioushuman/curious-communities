import { TaskEither } from 'fp-ts/lib/TaskEither';
import { UpsertMemberSourceRequestDto } from '../../infra/upsert-member-source/dto/upsert-member-source.request.dto';

/**
 * This allows us to define a type for the acceptable message formats
 */
export type MemberSourceMessage = UpsertMemberSourceRequestDto;

/**
 * A repository for member source queue
 */
export abstract class MemberSourceQueueService {
  /**
   * Send a batch of messages
   */
  abstract upsertMembers(
    messages: MemberSourceMessage[]
  ): TaskEither<Error, void>;
}
