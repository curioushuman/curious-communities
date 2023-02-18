import { TaskEither } from 'fp-ts/lib/TaskEither';
import { UpdateGroupMemberRequestDto } from '../../infra/update-group-member/dto/update-group-member.request.dto';

/**
 * This allows us to define a type for the acceptable message formats
 */
export type GroupMemberMessage = UpdateGroupMemberRequestDto;

/**
 * A repository for member source messaging
 */
export abstract class GroupMemberMessagingService {
  /**
   * Send a batch of messages
   */
  abstract sendMessageBatch(
    messages: GroupMemberMessage[]
  ): TaskEither<Error, void>;
}
