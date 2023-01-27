import { LoggableLogger } from '@curioushuman/loggable';
import { HttpService } from '@nestjs/axios';

/**
 * Dirty little type hack that emulates just those parts of Runtype.Record that we need
 *
 * TODO: see if you can replace the replica with a derivative of Runtype
 */
export interface RunTypeReplica {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  omit: (key: string) => any;
  fields: Record<string, unknown>;
}

/**
 * E is for entity
 * R is for response type (from Salesforce)
 */
export abstract class SalesforceApiSourceRepository {
  abstract logger: LoggableLogger;
  abstract httpService: HttpService;

  constructor(
    protected sourceName: string,
    private responseRuntype: RunTypeReplica
  ) {}

  protected fields(): string {
    const rawRunType = this.responseRuntype.omit('attributes');
    const fields = Object.keys(rawRunType.fields).join(',');
    this.logger.verbose(fields);
    return fields;
  }

  protected prepareFindOneUri(id: string): string {
    const endpoint = `sobjects/${this.sourceName}/${id}`;
    this.logger.debug(`Finding ${this.sourceName} with endpoint ${endpoint}`);
    return endpoint;
  }
}
