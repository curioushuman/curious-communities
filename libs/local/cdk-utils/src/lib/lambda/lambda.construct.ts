import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import {
  NodejsFunction,
  NodejsFunctionProps,
} from 'aws-cdk-lib/aws-lambda-nodejs';

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
    // timeout: cdk.Duration.minutes(1),
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
   * Just need to merge the internal objects and arrays rather than have them overridden
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
}
