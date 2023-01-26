import { findSourceIdAsValue } from '@curioushuman/common';
import {
  Participant,
  prepareParticipantExternalIdSource,
} from '../../../domain/entities/participant';
import { ParticipantSourceIdSource } from '../../../domain/value-objects/participant-source-id-source';
import config from '../../../static/config';
import { DynamoDbCourseMapper } from './course.mapper';
import { DynamoDbItem } from './types/item';
import {
  DynamoDbParticipantAttributes,
  DynamoDbParticipantKeys,
} from './types/participant';

export class DynamoDbParticipantMapper {
  public static toDomain(item: DynamoDbItem): Participant {
    const sourceId = item.Participant_SourceIdCOURSE
      ? prepareParticipantExternalIdSource(item.Participant_SourceIdCOURSE)
      : undefined;
    const course = DynamoDbCourseMapper.toDomain(item);
    return Participant.check({
      // IMPORTANT: this is sk, not pk. Always check the keys method below
      id: item.sortKey,

      sourceIds: sourceId ? [sourceId] : [],

      status: item.Participant_Status,
      name: item.Participant_Name,
      email: item.Participant_Email,
      organisationName: item.Participant_OrganisationName,

      accountOwner: item.AccountOwner,

      course,
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
    const sourceIdValue = findSourceIdAsValue<ParticipantSourceIdSource>(
      participant.sourceIds,
      config.defaults.primaryAccountSource
    );
    return DynamoDbParticipantKeys.check({
      primaryKey: participant.courseId,
      sortKey: participant.id,

      Sk_Course_Slug: participant.id,
      Sk_Course_SourceIdCOURSE: participant.id,
      Sk_Participant_SourceIdCOURSE: sourceIdValue,
    });
  }

  /**
   * Function which focuses purely on the attributes
   */
  public static toPersistenceAttributes(
    participant: Participant
  ): DynamoDbParticipantAttributes {
    const sourceIdValue = findSourceIdAsValue<ParticipantSourceIdSource>(
      participant.sourceIds,
      config.defaults.primaryAccountSource
    );
    return {
      Participant_SourceIdCOURSE: sourceIdValue,
      Participant_CourseId: participant.courseId,
      Participant_MemberId: participant.memberId,

      Participant_Status: participant.status,
      Participant_Name: participant.name,
      Participant_Email: participant.email,
      Participant_OrganisationName: participant.organisationName,

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
  public static toPersistence(participant: Participant): DynamoDbItem {
    const keys = DynamoDbParticipantMapper.toPersistenceKeys(participant);
    const attributes =
      DynamoDbParticipantMapper.toPersistenceAttributes(participant);
    const courseAttributes = DynamoDbCourseMapper.toPersistenceAttributes(
      participant.course
    );
    return {
      ...keys,
      ...attributes,
      ...courseAttributes,
    };
  }
}
