import { Static } from 'runtypes';
import { ExternalId } from '../../../../../domain/value-objects/external-id';

export const TestSourceId = ExternalId.withBrand('TestSourceId');

export type TestSourceId = Static<typeof TestSourceId>;
