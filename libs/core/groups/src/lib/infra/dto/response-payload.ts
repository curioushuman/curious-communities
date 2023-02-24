import {
  CoAwsResponseEvent,
  CoAwsResponseOutcome,
  CoAwsResponsePayload,
  CoAwsResponsePayloadRuleDetail,
} from '@curioushuman/common';
import {
  CourseGroupMemberBaseResponseDto,
  CourseGroupMemberResponseDto,
} from './course-group-member.response.dto';
import {
  CourseGroupBaseResponseDto,
  CourseGroupResponseDto,
} from './course-group.response.dto';
import { GroupMemberSourceResponseDto } from './group-member-source.response.dto';
import { GroupMemberResponseDto } from './group-member.response.dto';
import { GroupSourceResponseDto } from './group-source.response.dto';
import { GroupBaseResponseDto } from './group.response.dto';
import {
  StandardGroupMemberBaseResponseDto,
  StandardGroupMemberResponseDto,
} from './standard-group-member.response.dto';
import {
  StandardGroupBaseResponseDto,
  StandardGroupResponseDto,
} from './standard-group.response.dto';

/**
 * These are the responses currently supported by the API
 */
interface ResponsePayloadEntityDetailMap {
  /** group */
  group: GroupBaseResponseDto;
  'group-base': GroupBaseResponseDto;
  'course-group': CourseGroupResponseDto;
  'course-group-base': CourseGroupBaseResponseDto;
  'standard-group': StandardGroupResponseDto;
  'standard-group-base': StandardGroupBaseResponseDto;
  /** group source */
  'group-source': GroupSourceResponseDto;

  /** group member */
  'group-member': GroupMemberResponseDto;
  'course-group-member': CourseGroupMemberResponseDto;
  'course-group-member-base': CourseGroupMemberBaseResponseDto;
  'standard-group-member': StandardGroupMemberResponseDto;
  'standard-group-member-base': StandardGroupMemberBaseResponseDto;
  /** group member source; allow for undefined during delete */
  'group-member-source': GroupMemberSourceResponseDto | undefined;
}

export type ResponsePayloadEntityName = keyof ResponsePayloadEntityDetailMap;

/**
 * Builds upon the base response payload, but constrained for this context
 */
export type ResponsePayload<N extends ResponsePayloadEntityName> =
  CoAwsResponsePayload<N, ResponsePayloadEntityDetailMap[N]>;

/**
 * This is the type we would use in AWS CDK context to help define rules for event subscriptions
 *
 * NOTE: we won't be able to use these within a CDK context until we've packaged these services properly
 */
export type ResponsePayloadRuleDetail<N extends ResponsePayloadEntityName> =
  CoAwsResponsePayloadRuleDetail<N, ResponsePayloadEntityDetailMap[N]>;

/**
 * Helper function to prepare the payload
 */
export const prepareResponsePayload =
  <N extends ResponsePayloadEntityName>(
    entityName: N,
    event: CoAwsResponseEvent,
    outcome: CoAwsResponseOutcome
  ): ((
    entityDetail: ResponsePayloadEntityDetailMap[N]
  ) => ResponsePayload<N>) =>
  (entityDetail: ResponsePayloadEntityDetailMap[N]) => ({
    event,
    outcome,
    entity: entityName,
    detail: entityDetail,
  });

/**
 * Convenience function to prepare the payload during upsert events
 */
export const prepareUpsertResponsePayload =
  <N extends ResponsePayloadEntityName>(
    entityName: N,
    updated = false,
    noChange = false
  ): ((
    entityDetail: ResponsePayloadEntityDetailMap[N]
  ) => ResponsePayload<N>) =>
  (entityDetail: ResponsePayloadEntityDetailMap[N]) => ({
    event: updated ? 'updated' : 'created',
    outcome: noChange ? 'no-change' : 'success',
    entity: entityName,
    detail: entityDetail,
  });

/**
 * Convenience function to prepare the payload during delete events
 */
export const prepareDeleteResponsePayload =
  <N extends ResponsePayloadEntityName>(
    entityName: N,
    noChange = false
  ): ((
    entityDetail: ResponsePayloadEntityDetailMap[N]
  ) => ResponsePayload<N>) =>
  (entityDetail: ResponsePayloadEntityDetailMap[N]) => ({
    event: 'deleted',
    outcome: noChange ? 'no-change' : 'success',
    entity: entityName,
    detail: entityDetail,
  });
