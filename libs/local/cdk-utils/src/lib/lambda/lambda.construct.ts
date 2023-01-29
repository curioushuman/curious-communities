import * as cdk from 'aws-cdk-lib';
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
import { resourceNameTitle } from '../utils/name';
import { LambdaProps } from './lambda.types';

/**
 * Create a lambda function with useful defaults
 */
export class LambdaConstruct extends Construct {
  public lambdaFunction: NodejsFunction;

  private defaultProps: NodejsFunctionProps = {
    architecture: lambda.Architecture.X86_64,
    bundling: {
      minify: true,
      sourceMap: true,
      externalModules: [
        'aws-sdk',
        '@curioushuman/loggable',
        '@nestjs/common',
        '@nestjs/core',
      ],
    },
    environment: {
      NODE_OPTIONS: '--enable-source-maps',
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

    /**
     * Required layers
     */
    const chLayerNodeModules = new ChLayerFrom(this, 'node-modules');
    this.defaultProps.layers?.push(chLayerNodeModules.layer);
    const chLayerShared = new ChLayerFrom(this, 'shared');
    this.defaultProps.layers?.push(chLayerShared.layer);

    const lambdaProps = this.mergeLambdaProps(props.lambdaProps);

    const [functionName, functionTitle] = resourceNameTitle(id, 'Lambda');
    this.lambdaFunction = new NodejsFunction(this, functionTitle, {
      functionName: functionName,
      entry: props.lambdaEntry,
      ...lambdaProps,
    });
    // ALWAYS ADD TAGS
    // TODO - add better tags
    cdk.Tags.of(this.lambdaFunction).add('identifier', functionTitle);
  }

  /**
   * Need to merge the internal objects and arrays rather than have them overridden
   */
  private mergeLambdaProps(props: NodejsFunctionProps): NodejsFunctionProps {
    const defaultModules = this.defaultProps?.bundling?.externalModules || [];
    const externalModules = props?.bundling?.externalModules
      ? [...defaultModules, ...props.bundling.externalModules]
      : defaultModules;
    const defaultLayers = this.defaultProps?.layers || [];
    const layers = props?.layers
      ? [...defaultLayers, ...props.layers]
      : defaultLayers;
    return {
      ...this.defaultProps,
      ...props,
      bundling: {
        ...this.defaultProps?.bundling,
        ...props?.bundling,
        externalModules,
      },
      layers,
    };
  }

  /**
   * Adds the Salesforce environment variables to the lambda
   */
  public addEnvironmentSalesforce(): void {
    /**
     * If we don't have the appropriate environment variables set,
     * throw an error
     */
    if (!process.env.SALESFORCE_CONSUMER_KEY) {
      throw new Error('SALESFORCE_CONSUMER_KEY is not set');
    }

    /**
     * Here, we are going to set the SF private key env var
     * from the local file we have.
     */
    const privateKeyPath = pathResolve(
      __dirname,
      '../../../../../env/jwtRS256.key'
    );
    if (!existsSync(privateKeyPath)) {
      throw new Error('SALESFORCE_PRIVATE_KEY file missing');
    }
    const privateKeyBuffer = readFileSync(privateKeyPath);
    if (!privateKeyBuffer) {
      throw new Error('SALESFORCE_PRIVATE_KEY file is empty');
    }

    /**
     * These are the required vars for Salesforce
     */
    const environment: Record<string, string> = {
      NODE_ENV: process.env.NODE_ENV || 'test',
      AWS_NAME_PREFIX: process.env.AWS_NAME_PREFIX || '',
      SALESFORCE_CONSUMER_KEY: process.env.SALESFORCE_CONSUMER_KEY || 'BROKEN',
      SALESFORCE_CONSUMER_SECRET:
        process.env.SALESFORCE_CONSUMER_SECRET || 'BROKEN',
      SALESFORCE_USER: process.env.SALESFORCE_USER || 'BROKEN',
      SALESFORCE_URL_AUTH: process.env.SALESFORCE_URL_AUTH || 'BROKEN',
      SALESFORCE_URL_DATA: process.env.SALESFORCE_URL_DATA || 'BROKEN',
      SALESFORCE_URL_DATA_VERSION:
        process.env.SALESFORCE_URL_DATA_VERSION || 'BROKEN',
      SALESFORCE_PRIVATE_KEY: privateKeyBuffer.toString(),
    };

    /**
     * Now we will add them to the lambda
     */
    Object.keys(environment).forEach((key) => {
      this.lambdaFunction.addEnvironment(key, environment[key]);
    });
  }
}
