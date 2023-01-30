import { Injectable } from '@nestjs/common';
import { Auth0ApiRepositoryError } from './repository.error-factory.types';
import { BasicRepositoryErrorFactory } from '../common/repository.error-factory';

/**
 * Factory to interpret and produce consistent errors from Auth0.
 *
 * Seems to be bog standard HTTP errors.
 */
@Injectable()
export class Auth0ApiRepositoryErrorFactory extends BasicRepositoryErrorFactory<Auth0ApiRepositoryError> {}
