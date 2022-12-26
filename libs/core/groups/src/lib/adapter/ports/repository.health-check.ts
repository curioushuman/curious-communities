import { TaskEither } from 'fp-ts/lib/TaskEither';

export abstract class RepositoryHealthCheck {
  abstract livenessProbe(): TaskEither<Error, boolean>;
}
