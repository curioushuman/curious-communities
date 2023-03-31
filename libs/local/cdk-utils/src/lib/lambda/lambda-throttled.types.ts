import { ChLambdaFrom } from './lambda-from.construct';
import type { LambdaConstruct } from './lambda.construct';

export interface LambdaThrottledLambdas {
  throttled: LambdaConstruct;
  queue?: LambdaConstruct;
  proxy?: LambdaConstruct | ChLambdaFrom;
}

/**
 * Props required to initialize lambda
 */
export interface LambdaThrottledProps {
  lambdas: LambdaThrottledLambdas;
}
