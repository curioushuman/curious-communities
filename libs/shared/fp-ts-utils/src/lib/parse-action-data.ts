import { LoggerService } from '@nestjs/common';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { ValidationAllowedErrorTypeName } from '@curioushuman/error-factory';

import { logParse } from './log-parse';

type Parser<I, O> = (data: I) => O;

/**
 * Standardized way to parse data, and bring it into a TE flow.
 *
 * Full credit to VincentJouanne
 * - https://github.com/VincentJouanne/nest-clean-architecture
 *
 * TODO
 * - [ ] accept array of parsers as well as a single parser
 *       UPDATE: I gave this a good bash, but couldn't get it to stick
 *       Tried rest parameter, and then spread operator into pipe
 *       Tried array.reduce
 *       Tried converting array to Tuple, with spread operator
 *       The major problem was that InputLike and OutputLike could be different
 */
export const parseActionData =
  <InputLike, OutputLike, ErrorLike extends Error>(
    parser: Parser<InputLike, OutputLike>,
    logger: LoggerService,
    asErrorType?: ValidationAllowedErrorTypeName
  ) =>
  (data: InputLike): TE.TaskEither<ErrorLike, OutputLike> => {
    // Our current validation methods throw exceptions, so we need to handle them
    const tryParse = E.tryCatch<ErrorLike, OutputLike>(
      () => {
        // NOTE: logging context and data here
        // so we see it in both error/success cases
        const context = `parseActionData: ${parser.name}`;
        logger.debug ? logger.debug(context) : logger.log(context);
        logger.verbose ? logger.verbose(data) : logger.log(data);
        return pipe(data, parser);
      },
      (error: unknown) => error as ErrorLike
    );
    return pipe(tryParse, TE.fromEither, logParse(logger, asErrorType));
  };
