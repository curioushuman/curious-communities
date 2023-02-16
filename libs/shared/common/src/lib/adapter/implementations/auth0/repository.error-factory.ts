import { Injectable } from '@nestjs/common';
import { BasicRepositoryErrorFactory } from '../common/repository.error-factory';
import { Auth0ApiRepositoryError } from './__types__';

/**
 * Factory to interpret and produce consistent errors from Auth0.
 *
 * Seems to be bog standard HTTP errors.
 */
@Injectable()
export class Auth0ApiRepositoryErrorFactory extends BasicRepositoryErrorFactory<Auth0ApiRepositoryError> {}
