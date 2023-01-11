import { Group } from '../../domain/entities/group';
import { GroupRepositoryBase } from './group.repository.base';

/**
 * Repository for the Group entity
 */
export abstract class GroupRepository extends GroupRepositoryBase<Group> {}
