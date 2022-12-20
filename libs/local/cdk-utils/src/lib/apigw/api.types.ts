import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import type { StageName } from '../utils/name.types';
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
