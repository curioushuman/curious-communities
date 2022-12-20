import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggableLogger extends ConsoleLogger {
  public override setContext(context: string): void {
    this.context = context;
  }
}
