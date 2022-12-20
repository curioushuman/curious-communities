import { HttpException, Injectable } from '@nestjs/common';
import { RepositoryErrorFactory } from '../repository.error-factory';

@Injectable()
export class FakeRepositoryErrorFactory extends RepositoryErrorFactory {
  public errorStatusCode(error: HttpException): number {
    return error.getStatus();
  }

  public errorDescription(error: HttpException): string {
    return error.message;
  }
}
