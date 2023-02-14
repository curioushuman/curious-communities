import { DynamoDbMapper } from '@curioushuman/common';
import { Participant } from '../../../domain/entities/participant';
import { CourseSourceIdSource } from '../../../domain/value-objects/course-source-id-source';
import { ParticipantSourceIdSource } from '../../../domain/value-objects/participant-source-id-source';
import config from '../../../static/config';
import { DynamoDbCourseMapper } from './course.mapper';
import { CoursesDynamoDbItem } from './entities/item';
import {
  DynamoDbParticipantAttributes,
  DynamoDbParticipantKeys,
} from './entities/participant';
import { DynamoDbMemberMapper } from './member.mapper';

export class DynamoDbParticipantMapper {
  public static toDomain(item: CoursesDynamoDbItem): Participant {
    const course = DynamoDbCourseMapper.toDomain(item);
    const member = DynamoDbMemberMapper.toDomain(item);
    return Participant.check({
      // IMPORTANT: this is sk, not pk. Always check the keys method below
      id: item.sortKey,

      // as it's a child, it's stored in the parent (DDB) collection
      courseId: item.primaryKey,

      // other ids
      memberId: item.Participant_MemberId,
      sourceIds: DynamoDbMapper.prepareDomainSourceIds<
        CoursesDynamoDbItem,
        ParticipantSourceIdSource
      >(item, 'Participant', config.defaults.accountSources),

      // attributes
      status: item.Participant_Status,
      accountOwner: item.AccountOwner,

      // relationships
      course,
      member,
    });
  }

  /**
   * Function to define the composite keys
   *
   * TODO: later we could get fancier with this
   */
  public static toPersistenceKeys(
    participant: Participant
  ): DynamoDbParticipantKeys {
    const sourceIds =
      DynamoDbMapper.preparePersistenceSourceIds<ParticipantSourceIdSource>(
        participant.sourceIds,
        'Participant',
        config.defaults.accountSources
      );
    const courseSourceIds =
      DynamoDbMapper.preparePersistenceSourceIds<CourseSourceIdSource>(
        participant.course.sourceIds,
        'Course',
        config.defaults.accountSources
      );
    return DynamoDbParticipantKeys.check({
      // composite key
      primaryKey: participant.courseId,
      sortKey: participant.id,

      // other keys; participant
      ...sourceIds,

      // other keys; course
      Sk_Course_Slug: participant.course.slug,
      ...courseSourceIds,
    });
  }

  /**
   * Function which focuses purely on the attributes
   */
  public static toPersistenceAttributes(
    participant: Participant
  ): DynamoDbParticipantAttributes {
    const sourceIdFields =
      DynamoDbMapper.preparePersistenceSourceIdFields<ParticipantSourceIdSource>(
        participant.sourceIds,
        'Participant',
        config.defaults.accountSources
      );
    return {
      ...sourceIdFields,
      Participant_MemberId: participant.memberId,
      Participant_Status: participant.status,
      AccountOwner: participant.accountOwner,
    };
  }

  /**
   * Prepare Dynamodb record for saving
   *
   * NOTE: we're returning a DynamoDbItem here, not a DynamoDbParticipant.
   * The reason is that DynamoDb needs a complete record in place, this is
   * just how it works.
   */
  public static toPersistence(participant: Participant): CoursesDynamoDbItem {
    const keys = DynamoDbParticipantMapper.toPersistenceKeys(participant);
    const attributes =
      DynamoDbParticipantMapper.toPersistenceAttributes(participant);
    const courseAttributes = DynamoDbCourseMapper.toPersistenceAttributes(
      participant.course
    );
    const memberAttributes = DynamoDbMemberMapper.toPersistenceAttributes(
      participant.member
    );
    return {
      ...keys,
      ...attributes,
      ...courseAttributes,
      ...memberAttributes,
    };
  }
}
