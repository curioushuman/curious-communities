import { Injectable } from '@nestjs/common';

import { ServiceErrorFactory } from './service.error-factory';

@Injectable()
export class BasicServiceErrorFactory extends ServiceErrorFactory {
  // we don't need the error status for this type of error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public errorStatusCode(_: Error): number {
    return 500;
  }

  public errorDescription(error: Error): string {
    if ('toString' in error) {
      return error.toString();
    }
    return 'Unknown service error';
  }
}
