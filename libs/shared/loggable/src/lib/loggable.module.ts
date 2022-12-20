import { Module } from '@nestjs/common';

import { LoggableLogger } from './infra/loggable.logger';

@Module({
  providers: [LoggableLogger],
  exports: [LoggableLogger],
})
export class LoggableModule {}
