import { Injectable } from '@nestjs/common';
import { TribeApiRepositoryError } from './repository.error-factory.types';
import { BasicRepositoryErrorFactory } from '../common/repository.error-factory';

/**
 * Factory to interpret and produce consistent errors from Tribe.
 *
 * Seems to be bog standard HTTP errors.
 */
@Injectable()
export class TribeApiRepositoryErrorFactory extends BasicRepositoryErrorFactory<TribeApiRepositoryError> {}
