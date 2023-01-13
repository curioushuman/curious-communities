import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';

import { resolve as pathResolve } from 'path';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import { CoApiConstruct } from '../../../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

/**
 * Props required to initialize a CO API Construct
 */
export interface CoursesHookProps {
  apiConstruct: CoApiConstruct;
  rootResource: apigateway.IResource;
  requestParameters: { [key: string]: boolean };
  eventBus: events.IEventBus;
}

/**
 * Components required for the api-admin stack courses:hook resource
 *
 * TODO:
 * - [ ] idempotency for the hook
 *       do we assume each hit of the hook is an independent event?
 *       can we do it another way? Maybe specific to the event?
 *       https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/
 */
export class CoursesHookConstruct extends Construct {
  private apiConstruct: CoApiConstruct;
  private rootResource: apigateway.IResource;
  private eventBus: events.IEventBus;

  private awsIntegration: apigateway.AwsIntegration;
  private methodOptions: apigateway.MethodOptions;

  constructor(scope: Construct, id: string, props: CoursesHookProps) {
    super(scope, id);

    this.apiConstruct = props.apiConstruct;
    this.rootResource = props.rootResource;
    this.eventBus = props.eventBus;

    /**
     * hook: request mapping template
     * to convert API input/params/body, into acceptable lambda input
     */
    const eventSourceId = `apigw-${this.apiConstruct.id}-courses-hook`;
    const coursesHookRequestTemplate = CoApiConstruct.vtlTemplateFromFile(
      pathResolve(__dirname, './hook.map-request.vtl')
    )
      .replace('source.id', eventSourceId)
      .replace('eventBus.eventBusArn', this.eventBus.eventBusArn);

    /**
     * hook: Acceptable Responses from EventBridge
     * For more info on integrationResponses check CoApiConstruct
     */

    // SUCCESS
    const coursesHookFunctionSuccessResponse: apigateway.IntegrationResponse = {
      statusCode: '200',
      responseTemplates: {
        'application/json': JSON.stringify({
          id: "$input.path('$.Entries[0].EventId')",
        }),
      },
    };
    // ERROR
    const coursesHookFunctionServerErrorResponse =
      CoApiConstruct.serverErrorResponse();
    const coursesHookFunctionClientErrorResponse =
      CoApiConstruct.clientErrorResponse();

    /**
     * hook: eventbridge Integration
     */
    this.awsIntegration = new apigateway.AwsIntegration({
      service: 'events',
      action: 'PutEvents',
      integrationHttpMethod: 'POST',
      options: {
        credentialsRole: this.apiConstruct.role,
        requestTemplates: {
          'application/json': coursesHookRequestTemplate,
        },
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        integrationResponses: [
          coursesHookFunctionSuccessResponse,
          coursesHookFunctionServerErrorResponse,
          coursesHookFunctionClientErrorResponse,
        ],
      },
    });

    /**
     * Default method response parameters
     */
    // CORS
    const defaultMethodResponseParametersCors =
      CoApiConstruct.methodResponseParametersCors();

    this.methodOptions = {
      // Here we can define path, querystring, and acceptable headers
      requestParameters: props.requestParameters,
      requestValidator: this.apiConstruct.requestValidators['basic-get'],
      // what we allow to be returned as a response
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: { ...defaultMethodResponseParametersCors },
          responseModels: {
            'application/json':
              this.apiConstruct.responseModels['hook-event-success'],
          },
        },
        {
          statusCode: '400',
          responseParameters: { ...defaultMethodResponseParametersCors },
          responseModels: {
            'application/json': this.apiConstruct.responseModels['error'],
          },
        },
        {
          statusCode: '500',
          responseParameters: { ...defaultMethodResponseParametersCors },
          responseModels: {
            'application/json': this.apiConstruct.responseModels['error'],
          },
        },
      ],
    };

    /**
     * hook: method definition
     * - AWS integration
     */
    this.rootResource.addMethod('GET', this.awsIntegration, this.methodOptions);
  }
}
