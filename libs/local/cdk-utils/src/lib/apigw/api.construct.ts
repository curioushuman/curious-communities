import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { readFileSync } from 'fs';
import {
  transformIdToResourceName,
  transformIdToResourceTitle,
} from '../utils/name';
import {
  ResourceId,
  ResourceNameTitle,
  SupportedResourceType,
} from '../utils/name.types';
import {
  CoApiProps,
  CoApiRequestValidatorProps,
  CoApiResponseModelProps,
} from './api.types';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
// import {
//   clientErrors,
//   serverErrors,
// } from '../../../../../../dist/shared/layers/shared/nodejs/node_modules/@curioushuman/error-factory/src/index.js';
// Long term we'll put them into packages
// import { clientErrors, serverErrors } from '@curioushuman/error-factory';
// ! UPDATE
// Importing locally won't work, we'll need to deploy as a package
// Until then I've removed the use of the @curioushuman/error-factory package

/**
 * CO API Construct
 * i.e. a standard API implementation, and some helpers
 *
 * TODO
 * - [ ] validation or camelCasing of applicationNamePrefix
 */
export class CoApiConstruct extends Construct {
  public id: ResourceId;
  public api: apigw.RestApi;
  public role: iam.Role;
  public responseModels: { [name: string]: apigw.Model };
  public requestValidators: { [name: string]: apigw.RequestValidator };
  public usagePlan: apigw.IUsagePlan;
  public apiKey: apigw.IApiKey;

  constructor(scope: Construct, id: string, props: CoApiProps) {
    super(scope, id);

    /**
     * This will check the id and prefix are the correct format
     * OR throw an error
     */
    this.id = ResourceId.check(id);

    /**
     * API Gateway
     * https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}/
     * https://ap-southeast-2.console.aws.amazon.com/apigateway/home?region=ap-southeast-2#/apis/txi21niwmd/stages/dev
     *
     * NOTES
     * - no proxy for all routes, integration defined per route
     * - if you make policy changes (even deletion) you'll need to redeploy the API (manually within the console)
     *   https://stackoverflow.com/questions/53016110/aws-api-gateway-user-anonymous-is-not-authorized-to-execute-api
     *
     * TODO
     * - [ ] tighten up the CORS defaults below
     */
    const [restApiName, restApiTitle] = this.resourceNameTitle('rest', 'Api');
    this.api = new apigw.RestApi(this, restApiTitle, {
      restApiName,
      description: props.description,
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        tracingEnabled: true,
        stageName: props.stageName || 'dev',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
      },
    });

    /**
     * IAM Role for our API gateway
     *
     * TODO:
     * - [ ] use ArnPrincipal(apiPublic) for assumedBy below
     */
    const [roleName, roleTitle] = this.resourceNameTitle('principal', 'Role');
    this.role = new iam.Role(this, roleTitle, {
      roleName,
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });

    /**
     * Required response models
     * NOTE: here is only to instantiate the object
     */
    this.responseModels = {
      error: this.addErrorResponseModelToApi(),
    };

    /**
     * Basic request validators
     * NOTE: here is only to instantiate the object
     */
    this.requestValidators = {
      'basic-get': this.addRequestValidatorToApi('basic-get', {
        validateRequestBody: false,
        validateRequestParameters: true,
      }),
    };

    /**
     * Add a basic usage plan
     * - [ ] configure in props
     * - [ ] dynamic key
     *
     * * Note: currently not in use, API open
     */
    this.usagePlan = this.api.addUsagePlan('UsagePlan', {
      name: 'CcApiUsagePlan',
      throttle: {
        burstLimit: 5,
        rateLimit: 10,
      },
      quota: {
        limit: 100,
        period: apigw.Period.DAY,
      },
    });

    /**
     * Add an API key
     * TODO
     * - [ ] configure in props
     * - [ ] dynamic key
     *
     * * Note: currently not in use, API open
     */
    this.apiKey = this.api.addApiKey('ApiKey', {
      apiKeyName: 'av-api-key',
      value: 'av-api-key-value-********',
    });
    this.usagePlan.addApiKey(this.apiKey);

    /**
     * Outputs
     */
    new cdk.CfnOutput(this, 'apiUrl', { value: this.api.urlForPath() });
    new cdk.CfnOutput(this, 'apiKey', { value: this.apiKey.toString() });
  }

  /**
   * Wrapper function to create a request validator
   */
  public addRequestValidatorToApi(
    id: ResourceId,
    props: CoApiRequestValidatorProps
  ): apigw.RequestValidator {
    const { validateRequestBody, validateRequestParameters } = props;
    const requestValidatorTitle = this.transformIdToResourceTitle(
      id,
      'RequestValidator'
    );
    const requestValidatorName = this.transformIdToResourceName(
      id,
      'RequestValidator'
    );
    return new apigw.RequestValidator(this, requestValidatorTitle, {
      restApi: this.api,
      // the properties below are optional
      requestValidatorName,
      validateRequestBody,
      validateRequestParameters,
    });
  }

  /**
   * This adds to the API, and retains it in the API construct for future use
   */
  public addRequestValidator(
    id: ResourceId,
    props: CoApiRequestValidatorProps
  ): apigw.RequestValidator {
    this.requestValidators[id] = this.addRequestValidatorToApi(id, props);
    return this.requestValidators[id];
  }

  /**
   * Allows us to keep our VTL templates in a file. This will pull in VTL as a string
   * and remove any new lines (as this is what is required by SNS).
   *
   * @param absoluteFilepath a filepath that has already been put through `resolve`
   * @returns VTL template as a single string
   */
  public static vtlTemplateFromFile(absoluteFilepath: string): string {
    return readFileSync(absoluteFilepath, 'utf8').replace(/(\r\n|\n|\r)/gm, '');
  }

  /**
   * Response models
   * i.e. these are the structures for data that will be returned from THIS API
   */

  /**
   * Error response model FROM this API
   */
  public addErrorResponseModelToApi(
    props?: CoApiResponseModelProps
  ): apigw.Model {
    // destructure, or assign default
    const { properties } = props || {
      properties: {
        message: { type: apigw.JsonSchemaType.STRING },
      },
    };
    return this.addResponseModelToApi('error', {
      properties,
    });
  }

  /**
   * Adds a response model to the API
   */
  public addResponseModelToApi(
    id: ResourceId,
    props: CoApiResponseModelProps
  ): apigw.Model {
    const { properties } = props;
    // this prefixes the name with the namePrefix
    const modelName = this.transformIdToResourceName(id, 'ResponseModel');
    // this doesn't, as we don't need it to be quite so specific within this scope
    const title = this.transformIdToResourceTitle(id, 'ResponseModel');
    return this.api.addModel(title, {
      contentType: 'application/json',
      modelName,
      schema: {
        schema: apigw.JsonSchemaVersion.DRAFT4,
        type: apigw.JsonSchemaType.OBJECT,
        title,
        properties,
      },
    });
  }

  /**
   * This adds to the API, and retains it in the API construct for future use
   */
  public addResponseModel(
    id: ResourceId,
    props: CoApiResponseModelProps
  ): apigw.Model {
    this.responseModels[id] = this.addResponseModelToApi(id, props);
    return this.responseModels[id];
  }

  /**
   * Integration responses
   * Non-proxy lambda integrations don't just pass-through all response from the lambda.
   * They need to be funneled through one or more response structures
   * These define what THIS API will accept as a response (FROM the lambda),
   * and how it will interpret it.
   *
   * RE selectionPattern
   * this is a regex that allows us to match an actual response from the lambda
   * to one of these defined/allowable responses (that we are saying our API will accept).
   * It is here we can whittle from a number of different custom errors, to a shortlist of
   * HTTP Exceptions we're comfortable communicating to the public client.
   *
   * NOTES
   * _"If the back end is an AWS Lambda function, the AWS Lambda
   * function error header is matched. For all other HTTP and AWS back
   * ends, the HTTP status code is matched."_
   * https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigw.IntegrationResponse.html
   * ---
   * defining no selectionPattern defines denotes the default response
   * https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-integration-settings-integration-response.html
   *
   */

  /**
   * A standard format for our API server errors
   * Anything that the client has no control over, or that is not a known error
   *
   * TODO:
   * - [ ] work out if all the CORS stuff is necessary here
   *   responseParameters: {
   *    'method.response.header.Content-Type': "'application/json'",
   *    'method.response.header.Access-Control-Allow-Origin': "'*'",
   *    'method.response.header.Access-Control-Allow-Credentials':
   *      "'true'",
   *    },
   */
  public static serverErrorResponse(): apigw.IntegrationResponse {
    return CoApiConstruct.errorResponse(
      '500',
      CoApiConstruct.serverErrorRegex()
    );
  }

  /**
   * Utility to pull together a regex based on our custom errors
   * that are indicative of an internal server error.
   *
   * TODO
   * - [ ] pull the error messages directly from error-factory
   */
  private static serverErrorRegex(): string {
    // const errorMessages = Object.values(serverErrors).map(
    //   (errorClass) => new errorClass().message.split(':')[0]
    // );
    const errorMessages = [
      'Invalid internal communication',
      'Source already exists within our database',
      'Source contains insufficient or invalid data',
      'Error authenticating at repository',
      'Error connecting to repository',
      'The repository is currently unavailable',
      'This particular feature does not yet exist, but is on our roadmap',
      'Something unexpected happened',
    ];
    return `^(${errorMessages.join('|')}).+`;
  }

  /**
   * A standard format for our API client errors
   * Things we need to offer feedback to them for
   *
   * TODO:
   * - [ ] similar RE CORS stuff
   */
  public static clientErrorResponse(): apigw.IntegrationResponse {
    return CoApiConstruct.errorResponse(
      '400',
      CoApiConstruct.clientErrorRegex()
    );
  }

  /**
   * Utility to pull together a regex based on our custom errors
   * that are indicative of a client error
   *
   * TODO
   * - [ ] pull the error messages directly from error-factory
   */
  private static clientErrorRegex(): string {
    // const errorMessages = Object.values(clientErrors).map(
    //   (errorClass) => new errorClass().message.split(':')[0]
    // );
    const errorMessages = ['Invalid request'];
    return `^(${errorMessages.join('|')}).+`;
  }

  /**
   * A standard format for our API client errors
   * Things we need to offer feedback to them for
   *
   * TODO:
   * - [ ] similar RE CORS stuff
   */
  public static notFoundErrorResponse(): apigw.IntegrationResponse {
    return CoApiConstruct.errorResponse(
      '404',
      CoApiConstruct.notFoundErrorRegex()
    );
  }

  /**
   * Utility to pull together a regex based on our custom errors
   * that are indicative of an item not found scenario
   *
   * TODO
   * - [ ] pull the error messages directly from error-factory
   */
  private static notFoundErrorRegex(): string {
    // const errorMessages = Object.values(clientErrors).map(
    //   (errorClass) => new errorClass().message.split(':')[0]
    // );
    const errorMessages = ['A matching item could not be found'];
    return `^(${errorMessages.join('|')}).+`;
  }

  /**
   * A standard format for our API client errors
   * Things we need to offer feedback to them for
   *
   * TODO:
   * - [ ] similar RE CORS stuff
   */
  public static errorResponse(
    statusCode: string,
    selectionPattern: string
  ): apigw.IntegrationResponse {
    return {
      selectionPattern,
      statusCode,
      responseTemplates: {
        'application/json': JSON.stringify({
          message: "$util.escapeJavaScript($input.path('$.errorMessage'))",
        }),
      },
    };
  }

  /**
   * A temp holding place for CORS stuff
   */
  public static methodResponseParametersCors(): Record<string, boolean> {
    return {
      'method.response.header.Content-Type': true,
      'method.response.header.Access-Control-Allow-Origin': true,
      'method.response.header.Access-Control-Allow-Credentials': true,
    };
  }

  /**
   * Utility functions
   */

  /**
   * A resource name needs to be unique across AWS, so is prefixed with the API name
   * and name prefix
   */
  public transformIdToResourceName(
    resourceId: ResourceId,
    resourceType: SupportedResourceType
  ): string {
    return transformIdToResourceName(`${this.id}-${resourceId}`, resourceType);
  }

  /**
   * A resource title needs only be unique within the context of the current API
   */
  public transformIdToResourceTitle(
    resourceId: ResourceId,
    resourceType: SupportedResourceType
  ): string {
    return transformIdToResourceTitle(resourceId, resourceType);
  }

  public resourceNameTitle(
    resourceId: ResourceId,
    resourceType: SupportedResourceType
  ): ResourceNameTitle {
    return [
      this.transformIdToResourceName(resourceId, resourceType),
      this.transformIdToResourceTitle(resourceId, resourceType),
    ];
  }
}
