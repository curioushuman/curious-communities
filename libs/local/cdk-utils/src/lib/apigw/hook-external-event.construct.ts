import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';
import { resolve as pathResolve } from 'path';

import { CoApiConstruct } from './api.construct';
import { ApiGwHookExternalEventProps } from './api.types';

/**
 * Components required for the api-admin stack courses:hook resource
 *
 * TODO:
 * - [ ] idempotency for the hook
 *       do we assume each hit of the hook is an independent event?
 *       can we do it another way? Maybe specific to the event?
 *       https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/
 */
export class ApiGwHookExternalEventConstruct extends Construct {
  private apiConstruct: CoApiConstruct;
  private eventBus: events.IEventBus;

  private awsIntegration: apigw.AwsIntegration;
  private methodOptions: apigw.MethodOptions;

  private requestParameters: Record<string, boolean> = {
    'method.request.path.sourceKey': true,
    'method.request.querystring.updatedStatus': false,
  };

  constructor(
    scope: Construct,
    entityId: string,
    props: ApiGwHookExternalEventProps
  ) {
    super(scope, entityId);

    this.apiConstruct = props.apiConstruct;
    this.eventBus = props.eventBus;

    /**
     * More specific request params
     */
    this.requestParameters[`method.request.path.${entityId}SourceEvent`] = true;
    this.requestParameters[`method.request.path.${entityId}SourceId`] = true;

    /**
     * Add the response model for the hook
     */
    this.addSuccessResponse();

    /**
     * hook: request mapping template
     * to convert API input/params/body, into acceptable lambda input
     */
    const eventSourceId = `${this.apiConstruct.id}-hook-external-event-${entityId}`;
    const hookRequestTemplate = CoApiConstruct.vtlTemplateFromFile(
      pathResolve(__dirname, '../../assets/hook.map-request.vtl')
    )
      .replaceAll('{entityId}', entityId)
      .replace('{sourceId}', eventSourceId)
      .replace('{eventBusArn}', this.eventBus.eventBusArn);

    /**
     * hook: Acceptable Responses from EventBridge
     * For more info on integrationResponses check CoApiConstruct
     */

    // SUCCESS
    const coursesHookFunctionSuccessResponse: apigw.IntegrationResponse = {
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
    this.awsIntegration = new apigw.AwsIntegration({
      service: 'events',
      action: 'PutEvents',
      integrationHttpMethod: 'POST',
      options: {
        credentialsRole: this.apiConstruct.role,
        requestTemplates: {
          'application/json': hookRequestTemplate,
        },
        passthroughBehavior: apigw.PassthroughBehavior.NEVER,
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
      requestParameters: this.requestParameters,
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
     * Set up the resource path
     */
    const entityResource = props.rootResource.addResource(entityId);
    const entitySourceKeyResource = entityResource.addResource('{sourceKey}');
    const entitySourceEventResource = entitySourceKeyResource.addResource(
      `{${entityId}SourceEvent}`
    );
    const fullResourcePath = entitySourceEventResource.addResource(
      `{${entityId}SourceId}`
    );

    /**
     * hook: method definition
     * - AWS integration
     */
    fullResourcePath.addMethod('GET', this.awsIntegration, this.methodOptions);
  }

  /**
   * We only need this added once for all hooks attached to this api
   */
  private addSuccessResponse(): void {
    if (this.apiConstruct.responseModels['hook-event-success']) {
      return;
    }
    this.apiConstruct.addResponseModel('hook-event-success', {
      properties: {
        message: { type: apigw.JsonSchemaType.STRING },
      },
    });
  }
}
