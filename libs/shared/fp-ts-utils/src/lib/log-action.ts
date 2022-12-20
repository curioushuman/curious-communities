import { HttpException, LoggerService } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { ErrorFactory } from '@curioushuman/error-factory';

/**
 * Standardized way to log an action; good or bad.
 *
 * Full credit to VincentJouanne
 * - https://github.com/VincentJouanne/nest-clean-architecture
 */

export const logAction =
  <ErrorLike extends Error, DataLike>(
    logger: LoggerService,
    errorFactory: ErrorFactory,
    successMessage: string,
    warningMessage: string
  ) =>
  (
    task: TE.TaskEither<ErrorLike, DataLike>
  ): TE.TaskEither<ErrorLike, DataLike> => {
    return pipe(
      task,
      TE.mapLeft((error: ErrorLike) => {
        const mappedError = errorFactory.error(error) as ErrorLike;
        const statusCode = errorLikeStatusCode(mappedError);
        if (statusCode !== 404) {
          // throw a warning if it's anything but a NOT FOUND error
          logger.warn(warningMessage);
          logger.error(error);
        } else {
          logger.debug ? logger.debug(error) : logger.log(error);
        }
        return mappedError;
      }),
      TE.map((data: DataLike) => {
        logger.debug
          ? logger.debug(successMessage)
          : logger.log(successMessage);
        logger.verbose ? logger.verbose(data) : logger.log(data);
        return data;
      })
    );
  };

const errorLikeStatusCode = <ErrorLike extends Error>(error: ErrorLike) => {
  let statusCode = 500;
  if (error instanceof HttpException) {
    statusCode = error.getStatus();
  }
  return statusCode;
};
