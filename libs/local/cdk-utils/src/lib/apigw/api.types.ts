import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import type { StageName } from '../utils/name.types';
import { CoApiConstruct } from './api.construct';
/**
 * Props required to initialize a CO API Construct
 */
export interface CoApiProps {
  description: string;
  stageName?: StageName;
}

/**
 * Props required to initialize a CO API Response Model
 */
export interface CoApiResponseModelProps {
  properties: {
    [name: string]: apigateway.JsonSchema;
  };
}

/**
 * Props required to initialize a CO API Response Model
 */
export interface CoApiRequestValidatorProps {
  validateRequestBody: boolean;
  validateRequestParameters: boolean;
}

/**
 * Props required to initialize an external-event hook
 */
export interface ApiGwHookExternalEventProps {
  apiConstruct: CoApiConstruct;
  rootResource: apigateway.IResource;
  eventBus: events.IEventBus;
}
