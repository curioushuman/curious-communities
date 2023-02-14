import { TaskEither } from 'fp-ts/lib/TaskEither';
import { ValueOf } from '../../utils/types';

export type RepositoryFindOneWithParentProps<I, P> = {
  value: ValueOf<I>;
  parentId: P;
};

/**
 * I is the entity identifierS!! not singular, the plural
 * P is the parent Identifier
 * E is the entity
 */
export type RepositoryFindOneWithParentMethod<I, E, P> = (
  props: RepositoryFindOneWithParentProps<I, P>
) => TaskEither<Error, E>;

/**
 * I is the entity identifierS!! not singular, the plural
 * E is the entity
 */
export interface RepositoryFindOneWithParent<I, E, P> {
  /**
   * Object lookup for findMethods
   */
  findOneBy: Record<keyof I, RepositoryFindOneWithParentMethod<I, E, P>>;

  /**
   * Find an entity by a given identifier
   *
   * This method will accept an entity identifier and value
   * and then determine which finder method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  findOne(identifier: keyof I): RepositoryFindOneWithParentMethod<I, E, P>;
}
