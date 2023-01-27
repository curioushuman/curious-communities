import { TaskEither } from 'fp-ts/lib/TaskEither';
import { ValueOf } from '../../utils/types';

/**
 * I is the entity identifierS!! not singular, the plural
 * E is the entity
 */
export type RepositoryFindMethod<I, E> = (
  value: ValueOf<I>
) => TaskEither<Error, E>;

/**
 * I is the entity identifierS!! not singular, the plural
 * E is the entity
 */
export interface RepositoryFindBy<I, E> {
  /**
   * Object lookup for findMethods
   */
  findOneBy: Record<keyof I, RepositoryFindMethod<I, E>>;

  /**
   * Find an entity by a given identifier
   *
   * This method will accept an entity identifier and value
   * and then determine which finder method to use.
   *
   * NOTE: will throw NotFoundException if not found
   */
  findOne(identifier: keyof I): RepositoryFindMethod<I, E>;
}
