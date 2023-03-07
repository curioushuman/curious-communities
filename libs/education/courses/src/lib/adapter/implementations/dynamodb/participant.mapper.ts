import { DynamoDbMapper } from '@curioushuman/common';
import {
  Participant,
  ParticipantBase,
} from '../../../domain/entities/participant';
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
    const participantBase = ParticipantBase.check({
      id: item.Participant_Id,
      courseId: item.Course_Id,

      // other ids
      memberId: item.Member_Id,
      sourceOrigin: item.Participant_Source_Origin,
      sourceIds: DynamoDbMapper.prepareDomainSourceIds<
        CoursesDynamoDbItem,
        ParticipantSourceIdSource
      >(item, 'Participant', config.defaults.accountSources),

      // attributes
      status: item.Participant_Status,
      accountOwner: item.AccountOwner,
    });

    return {
      ...participantBase,
      course,
      member,
    };
  }

  /**
   * Function to define the composite keys
   *
   * NOTES:
   * SK_{Index_Name} are overloaded secondary keys
   * it's a generic name for THE sortKey for the index Index_name
   * for participants the sortKey will be the participant id
   * and for courses, the sortKey (for this index) will be it's id
   *
   * ? do we want LastName to be our sortKey?
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
        config.defaults.accountSources,
        participant.id
      );
    const courseSourceIds =
      DynamoDbMapper.preparePersistenceSourceIds<CourseSourceIdSource>(
        participant.course.sourceIds,
        'Course',
        config.defaults.accountSources,
        participant.id
      );
    return DynamoDbParticipantKeys.check({
      // composite key
      primaryKey: participant.courseId,
      sortKey: participant.id,

      // other keys; participant
      Sk_Participant_Id: participant.id,
      ...sourceIds,

      // other keys; course
      Sk_Course_Slug: participant.id,
      ...courseSourceIds,

      // other keys; member
      Sk_Member_Id: participant.id,
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
      Participant_Source_Origin: participant.sourceOrigin,
      Participant_Id: participant.id,
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
