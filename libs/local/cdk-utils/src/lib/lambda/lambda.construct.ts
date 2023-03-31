import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as destinations from 'aws-cdk-lib/aws-lambda-destinations';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';
import { existsSync, readFileSync } from 'fs';
import { resolve as pathResolve } from 'path';

import { ChLayerFrom } from '../lambda/layer-from.construct';
import {
  generateCompositeResourceId,
  resourceNameTitle,
  transformIdToResourceTitle,
} from '../utils/name';
import {
  ChLambdaDestination,
  ChLambdaDestinationResources,
  ChLambdaDestinations,
  ChLambdaDestinationType,
  ChLambdaPropsDestinations,
  LambdaProps,
  PeriFunctionProps,
} from './lambda.types';

/**
 * Create a lambda function with useful defaults
 */
export class LambdaConstruct extends Construct {
  private constructId!: string;
  private serviceRole: iam.IRole | undefined = undefined;

  public lambdaFunction: NodejsFunction | lambda.Function;

  // we store destinations separately so we can add them to props during props prep
  private destinations: ChLambdaPropsDestinations = {};
  private destinationsEventBridge: ChLambdaDestinationResources<events.IEventBus> =
    {};

  private lambdaPropsBundling: NodejsFunctionProps['bundling'] = {
    minify: true,
    sourceMap: true,
    externalModules: [
      'aws-sdk',
      '@curioushuman/loggable',
      '@curioushuman/error-factory',
      '@curioushuman/common',
      '@nestjs/common',
      '@nestjs/core',
    ],
  };
  private lambdaProps: PeriFunctionProps = {
    architecture: lambda.Architecture.X86_64,
    environment: {
      NODE_OPTIONS: '--enable-source-maps',
      NODE_ENV: process.env.NODE_ENV || 'production',
      AWS_NAME_PREFIX: process.env.AWS_NAME_PREFIX || '',
    },
    logRetention: logs.RetentionDays.ONE_DAY,
    runtime: lambda.Runtime.NODEJS_16_X,
    memorySize: 128,
    handler: 'handler',
    layers: [] as lambda.ILayerVersion[],
    timeout: cdk.Duration.minutes(1),
    tracing: lambda.Tracing.ACTIVE,
  };

  constructor(scope: Construct, id: string, props: LambdaProps) {
    super(scope, id);

    this.constructId = id;

    /**
     * Make sure we have lambda code
     */
    if (!props.lambdaEntry && !props.lambdaCode) {
      throw new Error(
        `LambdaConstruct: You must provide either a lambdaEntry or lambdaCode`
      );
    }

    /**
     * Required layers
     */
    const chLayerNodeModules = new ChLayerFrom(this, 'node-modules');
    this.lambdaProps.layers?.push(chLayerNodeModules.layer);
    const chLayerShared = new ChLayerFrom(this, 'shared');
    this.lambdaProps.layers?.push(chLayerShared.layer);

    /**
     * Prepare destination
     */
    this.prepareDestinations(props);

    this.lambdaFunction = props.lambdaEntry
      ? this.prepareNodeJsLambda(props)
      : this.prepareLambda(props);

    // Add REQUIRED environment variables
    // the ones above are optional with defaults
    const envVars = ['AWS_ACCOUNT'];
    this.addEnvironmentVars(envVars);

    /**
     * Allow destinations
     * i.e. grant the required privileges to the lambda
     */
    this.allowDestinations();

    // ALWAYS ADD TAGS
    // TODO - add better tags
    // cdk.Tags.of(this.lambdaFunction).add('identifier', functionTitle);
  }

  private prepareNodeJsLambda(props: LambdaProps): NodejsFunction {
    if (!props.lambdaEntry) {
      throw new Error('LambdaConstruct: no lambda entry provided');
    }
    const lambdaProps = this.prepareNodeJsProps(props.lambdaProps);
    const [functionName, functionTitle] = resourceNameTitle(
      this.constructId,
      'Lambda'
    );
    return new NodejsFunction(this, functionTitle, {
      functionName,
      entry: props.lambdaEntry,
      ...lambdaProps,
    });
  }

  /**
   * Last time we tried this it didn't work
   *
   * I CANNOT get InlineCode to work.
   */
  private prepareLambda(props: LambdaProps): lambda.Function {
    if (!props.lambdaCode) {
      throw new Error('LambdaConstruct: no lambdaCode provided');
    }
    const lambdaProps = this.prepareFunctionProps(props.lambdaProps);
    const [functionName, functionTitle] = resourceNameTitle(
      this.constructId,
      'Lambda'
    );
    return new lambda.Function(this, functionTitle, {
      functionName,
      code: new lambda.InlineCode(props.lambdaCode),
      ...lambdaProps,
    });
  }

  public includesDestinations(): boolean {
    return Object.keys(this.destinations).length > 0;
  }

  public getDestinationEventBridge(
    destinationType: ChLambdaDestinationType
  ): events.IEventBus | undefined {
    return this.destinationsEventBridge[destinationType];
  }

  private allowDestinationsEventbridge(): void {
    const eventBuses = Object.values(this.destinationsEventBridge);
    if (eventBuses.length === 0) {
      return;
    }
    eventBuses.forEach((eventBus) => {
      eventBus.grantPutEventsTo(this.lambdaFunction);
    });
  }

  private allowDestinations(): void {
    this.allowDestinationsEventbridge();
  }

  private prepareDestinationEventBridge(
    destination: ChLambdaDestination,
    destinationType: ChLambdaDestinationType
  ): void {
    if (!destination.eventBus) {
      return;
    }
    const eventBridgeDestination = new destinations.EventBridgeDestination(
      destination.eventBus
    );
    this.destinations[destinationType] = eventBridgeDestination;
    this.destinationsEventBridge[destinationType] = destination.eventBus;
  }

  private prepareDestination(
    destinations: ChLambdaDestinations,
    destinationType: ChLambdaDestinationType
  ): void {
    if (!destinations[destinationType]) {
      return;
    }
    // NOTE: this is where you would check for at least one of the supported destinations
    // and then call the relevant prepareDestination method

    // typecasting safely as we've just done the check above
    this.prepareDestinationEventBridge(
      destinations[destinationType] as ChLambdaDestination,
      destinationType
    );
  }

  private prepareDestinations(props: LambdaProps): void {
    if (!props.destinations) {
      return;
    }
    this.prepareDestination(props.destinations, 'onFailure');
    this.prepareDestination(props.destinations, 'onSuccess');
  }

  /**
   * Need to merge the internal objects and arrays rather than have them overridden
   */
  private prepareFunctionProps(props?: NodejsFunctionProps): PeriFunctionProps {
    const defaultLayers = this.lambdaProps?.layers || [];
    const layers = props?.layers
      ? [...defaultLayers, ...props.layers]
      : defaultLayers;
    return {
      ...this.lambdaProps,
      ...this.destinations,
      ...props,
      layers,
    };
  }

  private prepareNodeJsProps(props?: NodejsFunctionProps): NodejsFunctionProps {
    const defaultModules = this.lambdaPropsBundling?.externalModules || [];
    const externalModules = props?.bundling?.externalModules
      ? [...defaultModules, ...props.bundling.externalModules]
      : defaultModules;
    const defaultLayers = this.lambdaProps?.layers || [];
    const layers = props?.layers
      ? [...defaultLayers, ...props.layers]
      : defaultLayers;
    return {
      ...this.lambdaProps,
      ...this.destinations,
      ...props,
      bundling: {
        ...this.lambdaPropsBundling,
        ...props?.bundling,
        externalModules,
      },
      layers,
    };
  }

  private prepareServiceRole(): iam.IRole {
    const serviceRoleId = generateCompositeResourceId(
      this.constructId,
      'service'
    );
    const serviceRoleTitle = transformIdToResourceTitle(serviceRoleId, 'Role');
    return new iam.Role(this, serviceRoleTitle, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
  }

  public getServiceRole(): iam.IRole {
    if (!this.serviceRole) {
      this.serviceRole = this.prepareServiceRole();
    }
    return this.serviceRole;
  }

  /**
   * ! NOTE: this is a duplicate from common
   * When we've made cdk-utils into a package we can remove this
   */
  private confirmEnvVars(requiredVars: string[]): void {
    requiredVars.forEach((envVar) => {
      if (!process.env[envVar]) {
        throw new Error(`Missing environment variable ${envVar}`);
      }
    });
  }

  private privateKeyToString(keyFilename: string): string {
    const privateKeyPath = pathResolve(
      __dirname,
      `../../../../../../../env/${keyFilename}`
    );
    if (!existsSync(privateKeyPath)) {
      throw new Error(`PRIVATE_KEY file missing: ${privateKeyPath}}`);
    }
    const privateKeyBuffer = readFileSync(privateKeyPath);
    if (!privateKeyBuffer) {
      throw new Error('PRIVATE_KEY file empty: ${privateKeyPath}}');
    }
    return privateKeyBuffer.toString();
  }

  /**
   * Adds custom environment variables to the lambda
   */
  public addCustomEnvironmentVars(vars: Record<string, string>): void {
    Object.keys(vars).forEach((key) => {
      this.lambdaFunction.addEnvironment(key, vars[key]);
    });
  }

  /**
   * Adds local environment variables to the lambda
   */
  public addEnvironmentVars(vars: string[]): void {
    /**
     * If we don't have the appropriate environment variables set,
     * throw an error
     */
    this.confirmEnvVars(vars);

    /**
     * Now we will add them to the lambda
     *
     * NOTE: we are typecasting as we've checked all of them above
     */
    vars.forEach((key) => {
      this.lambdaFunction.addEnvironment(key, process.env[key] as string);
    });
  }

  /**
   * Adds the Salesforce environment variables to the lambda
   */
  public addEnvironmentSalesforce(): void {
    /**
     * If we don't have the appropriate environment variables set,
     * throw an error
     */
    const requiredEnvVars = [
      'SALESFORCE_CONSUMER_KEY',
      'SALESFORCE_CONSUMER_SECRET',
      'SALESFORCE_USER',
      'SALESFORCE_URL_AUTH',
      'SALESFORCE_URL_DATA',
      'SALESFORCE_URL_DATA_VERSION',
    ];
    this.addEnvironmentVars(requiredEnvVars);

    // and private key
    const SALESFORCE_PRIVATE_KEY = this.privateKeyToString('jwtRS256.key');
    this.lambdaFunction.addEnvironment(
      'SALESFORCE_PRIVATE_KEY',
      SALESFORCE_PRIVATE_KEY
    );
  }

  /**
   * Adds the Auth0 environment variables to the lambda
   */
  public addEnvironmentAuth0(): void {
    /**
     * If we don't have the appropriate environment variables set,
     * throw an error
     */
    const requiredEnvVars = [
      'AUTH0_DOMAIN',
      'AUTH0_CLIENT_ID',
      'AUTH0_CLIENT_SECRET',
    ];
    this.addEnvironmentVars(requiredEnvVars);
  }

  /**
   * Adds the EdApp environment variables to the lambda
   */
  public addEnvironmentEdApp(): void {
    /**
     * If we don't have the appropriate environment variables set,
     * throw an error
     */
    const requiredEnvVars = ['ED_APP_DOMAIN', 'ED_APP_API_KEY'];
    this.addEnvironmentVars(requiredEnvVars);
  }

  /**
   * Adds the Bettermode environment variables to the lambda
   */
  public addEnvironmentBettermode(): void {
    /**
     * If we don't have the appropriate environment variables set,
     * throw an error
     */
    const requiredEnvVars = [
      'BETTERMODE_DOMAIN',
      'BETTERMODE_COMMUNITY_DOMAIN',
      'BETTERMODE_USER',
      'BETTERMODE_PASSWORD',
    ];
    this.addEnvironmentVars(requiredEnvVars);
  }

  /**
   * Adds the Tribe environment variables to the lambda
   */
  public addEnvironmentTribe(): void {
    /**
     * If we don't have the appropriate environment variables set,
     * throw an error
     */
    const requiredEnvVars = [
      'TRIBE_DOMAIN',
      'TRIBE_CLIENT_ID',
      'TRIBE_CLIENT_SECRET',
      'TRIBE_USER',
    ];
    this.addEnvironmentVars(requiredEnvVars);
  }
}
