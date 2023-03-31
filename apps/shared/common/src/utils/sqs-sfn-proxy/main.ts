import { executeTask } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';
import { parseDto, SfnService } from '@curioushuman/common';

import { locateDto, SqsSfnProxyDtoOrEvent } from './dto/request.dto';

export const handler = async (
  requestDtoOrEvent: SqsSfnProxyDtoOrEvent
): Promise<void> => {
  const context = 'SqsSfnProxy.Lambda';
  const logger = new LoggableLogger(context);

  logger.debug
    ? logger.debug(requestDtoOrEvent)
    : logger.log(requestDtoOrEvent);

  // grab the dto
  const requestPayload = parseDto(requestDtoOrEvent, locateDto);

  logger.debug ? logger.debug(requestPayload) : logger.log(requestPayload);

  const { id, stackId, prefix, dto } = requestPayload;

  const sfnService = new SfnService({
    stackId,
    prefix,
  });
  const task = sfnService.startExecution({
    id,
    input: {
      detail: dto,
    },
  });
  return executeTask(task);
};
