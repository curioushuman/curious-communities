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
export interface ParticipantsHookProps {
  apiConstruct: CoApiConstruct;
  rootResource: apigateway.IResource;
  eventBus: events.IEventBus;
}

/**
 * Components required for the api-admin stack participants:hook resource
 *
 * TODO:
 * - [ ] idempotency for the hook
 *       do we assume each hit of the hook is an independent event?
 *       can we do it another way? Maybe specific to the event?
 *       https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/
 */
export class ParticipantsHookConstruct extends Construct {
  private apiConstruct: CoApiConstruct;
  private rootResource: apigateway.IResource;
  private eventBus: events.IEventBus;

  private awsIntegration: apigateway.AwsIntegration;
  private methodOptions: apigateway.MethodOptions;

  constructor(scope: Construct, id: string, props: ParticipantsHookProps) {
    super(scope, id);

    this.apiConstruct = props.apiConstruct;
    this.rootResource = props.rootResource;
    this.eventBus = props.eventBus;

    /**
     * Resources
     * GET /courses/{courseIdSourceValue}/participants/{paxIdSourceValue}/hook/{eventType}?{updatedStatus?}
     */
    const paramType = this.rootResource.addResource('{eventType}');

    /**
     * hook: request mapping template
     * to convert API input/params/body, into acceptable lambda input
     */
    const eventSourceId = `apigw-${this.apiConstruct.id}-participants-hook`;
    const participantsHookRequestTemplate = CoApiConstruct.vtlTemplateFromFile(
      pathResolve(__dirname, './hook.map-request.vtl')
    )
      .replace('source.id', eventSourceId)
      .replace('eventBus.eventBusArn', this.eventBus.eventBusArn);

    /**
     * hook: Acceptable Responses from EventBridge
     * For more info on integrationResponses check CoApiConstruct
     */

    // SUCCESS
    const participantsHookFunctionSuccessResponse: apigateway.IntegrationResponse =
      {
        statusCode: '200',
        responseTemplates: {
          'application/json': JSON.stringify({
            id: "$input.path('$.Entries[0].EventId')",
          }),
        },
      };
    // ERROR
    const participantsHookFunctionServerErrorResponse =
      CoApiConstruct.serverErrorResponse();
    const participantsHookFunctionClientErrorResponse =
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
          'application/json': participantsHookRequestTemplate,
        },
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        integrationResponses: [
          participantsHookFunctionSuccessResponse,
          participantsHookFunctionServerErrorResponse,
          participantsHookFunctionClientErrorResponse,
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
      requestParameters: {
        'method.request.path.eventType': true,
        'method.request.path.courseIdSourceValue': true,
        'method.request.path.paxIdSourceValue': true,
        'method.request.querystring.updatedStatus': false,
      },
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
    paramType.addMethod('GET', this.awsIntegration, this.methodOptions);
  }
}
