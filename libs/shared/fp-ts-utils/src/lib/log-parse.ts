import { LoggerService } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import {
  ValidationAllowedErrorTypeName,
  ValidationErrorFactory,
} from '@curioushuman/error-factory';

/**
 * Standardized way to log an action; good or bad.
 *
 * NOTES
 * We always use the validationErrorFactory for these errors
 *
 * Full credit to VincentJouanne
 * - https://github.com/VincentJouanne/nest-clean-architecture
 */

const validationErrorFactory = new ValidationErrorFactory();

export const logParse =
  <ErrorLike extends Error, DataLike>(
    logger: LoggerService,
    asErrorType?: ValidationAllowedErrorTypeName
  ) =>
  (
    task: TE.TaskEither<ErrorLike, DataLike>
  ): TE.TaskEither<ErrorLike, DataLike> => {
    return pipe(
      task,
      TE.mapLeft((error: ErrorLike) => {
        const mappedError = validationErrorFactory.error(
          error,
          asErrorType
        ) as ErrorLike;
        logger.debug ? logger.debug(error) : logger.log(error);
        return mappedError;
      }),
      TE.map((data: DataLike) => {
        // NOTE: logging of data occurs in parseActionData (above)
        return data;
      })
    );
  };
