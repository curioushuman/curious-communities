import { RepositoryErrorFactory } from '@curioushuman/error-factory';
import { Injectable } from '@nestjs/common';

/**
 * This class in fact does nothing. We need a separate ErrorFactory per repository
 * so that we can use Nest to provide this class contract, and fulfil it with the
 * various kinds of concrete error factories we need.
 */
@Injectable()
export abstract class MemberRepositoryErrorFactory extends RepositoryErrorFactory {}
