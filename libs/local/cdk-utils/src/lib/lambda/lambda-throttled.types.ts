import type { LambdaConstruct } from './lambda.construct';

export interface LambdaThrottledLambdas {
  throttled: LambdaConstruct;
  queue?: LambdaConstruct;
  proxy?: LambdaConstruct;
}

/**
 * Props required to initialize lambda
 */
export interface LambdaThrottledProps {
  lambdas: LambdaThrottledLambdas;
  stackId: string;
  prefix?: string;
}
