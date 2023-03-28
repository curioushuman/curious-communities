import type { IEventBus } from 'aws-cdk-lib/aws-events';
import type { FunctionOptions, FunctionProps } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';

export type ChLambdaDestinationType = 'onSuccess' | 'onFailure';

/**
 * This is the type(s) of destination we currently support (in our Construct)
 */
export interface ChLambdaDestination {
  eventBus: IEventBus;
}

/**
 * Implementing our own destinations wrapper
 */
export type ChLambdaDestinations = {
  [K in ChLambdaDestinationType]?: ChLambdaDestination;
};

/**
 * This is used to store the destinations prior to popping them into the props
 *
 * We're removing the readonly property as it is temporary storage
 */
export type ChLambdaPropsDestinations = {
  -readonly [K in keyof Pick<
    FunctionOptions,
    'onSuccess' | 'onFailure'
  >]: FunctionOptions[K];
};

/**
 * A record of each of our destination resource types
 */
export type ChLambdaDestinationResources<T> = {
  [K in keyof ChLambdaPropsDestinations]?: T;
};

/**
 * Props required to initialize lambda
 */
export interface LambdaProps {
  lambdaEntry?: string;
  lambdaCode?: string;
  lambdaProps?: NodejsFunctionProps;
  destinations?: ChLambdaDestinations;
}

/**
 * We use this version of FunctionProps as we pull them together
 */
export type PeriFunctionProps = Omit<FunctionProps, 'code'>;
