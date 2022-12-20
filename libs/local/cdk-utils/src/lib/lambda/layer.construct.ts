import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

import { resourceNameTitle } from '../utils/name';
import { ResourceId } from '../utils/name.types';
import { ChLayerProps } from './layer.types';

/**
 * Layer construct
 *
 * This accepts a ResourceId, and spits out a lambda layer
 *
 * TODO
 * - [ ] there is no need to import fileLocation
 *       it is actually the same, we just need to navigate from root
 */
export class ChLayer extends Construct {
  public id: ResourceId;
  public layer: lambda.ILayerVersion;
  public defaultLayerProps: Partial<lambda.LayerVersionProps> = {
    compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
    compatibleArchitectures: [lambda.Architecture.X86_64],
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  };

  constructor(scope: Construct, id: string, props: ChLayerProps) {
    super(scope, id);

    /**
     * This will check the id and prefix are the correct format
     * OR throw an error
     */
    this.id = ResourceId.check(id);

    /**
     * Props
     */
    const layerProps: Partial<lambda.LayerVersionProps> = {
      ...this.defaultLayerProps,
      ...props.layerProps,
    };

    const code = lambda.Code.fromAsset(`${props.fileLocation}/${this.id}`);
    const [layerVersionName, layerVersionTitle] = resourceNameTitle(
      this.id,
      'Layer'
    );
    this.layer = new lambda.LayerVersion(this, layerVersionTitle, {
      ...layerProps,
      layerVersionName,
      code,
    });

    /**
     * Store the layer ARN so that for dependents where specific version
     * doesn't matter, they can always just get the latest version
     *
     * ! This is not an ideal solution
     * - https://www.10printiamcool.com/adventures-with-lambda-layers-and-cdk
     */
    const [parameterName, parameterTitle] = resourceNameTitle(
      ChLayer.layerParameterId(this.id),
      'SsmParameter'
    );
    new ssm.StringParameter(this, parameterTitle, {
      parameterName,
      stringValue: this.layer.layerVersionArn,
      description: `The latest ARN of ${layerVersionName}`,
      type: ssm.ParameterType.STRING,
      tier: ssm.ParameterTier.STANDARD,
    });

    /**
     * Outputs
     */
    new cdk.CfnOutput(this, layerVersionName, {
      value: this.layer.layerVersionArn,
    });
  }

  public static layerParameterId(layerId: ResourceId): ResourceId {
    return ResourceId.check(`${layerId}-arn-ssm-param`);
  }
}
