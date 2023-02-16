import { Injectable } from '@nestjs/common';
import { EdAppApiRepositoryError } from './__types__';
import { BasicRepositoryErrorFactory } from '../common/repository.error-factory';

/**
 * Factory to interpret and produce consistent errors from EdApp.
 *
 * Seems to be bog standard HTTP errors.
 */
@Injectable()
export class EdAppApiRepositoryErrorFactory extends BasicRepositoryErrorFactory<EdAppApiRepositoryError> {}
