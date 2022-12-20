import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

import {
  resourceNameTitle,
  transformIdToResourceName,
  transformIdToResourceTitle,
} from '../utils/name';
import { ResourceId } from '../utils/name.types';
import { ChLayerFromProps } from './layer-from.types';
import { ChLayer } from './layer.construct';

/**
 * LayerFrom construct
 *
 * This accepts a ResourceId, and
 */
export class ChLayerFrom extends Construct {
  public id: ResourceId;
  public layer: lambda.ILayerVersion;

  constructor(scope: Construct, id: string, props?: ChLayerFromProps) {
    super(scope, id);

    /**
     * This will check the id and prefix are the correct format
     * OR throw an error
     */
    this.id = ResourceId.check(id);

    const layerVersionTitle = transformIdToResourceTitle(this.id, 'Layer');
    const layerVersionArn = props?.version
      ? this.getSpecificLayerArn(this.id, props.version)
      : this.getLatestLayerArn(this.id);
    this.layer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      layerVersionTitle,
      layerVersionArn
    );
  }

  private getLatestLayerArn(layerId: ResourceId) {
    if (process.env.NODE_ENV === 'local') {
      return this.getSpecificLayerArn(layerId, 1);
    }

    const [parameterName, parameterTitle] = resourceNameTitle(
      ChLayer.layerParameterId(this.id),
      'SsmParameter'
    );
    const layerParameter = ssm.StringParameter.fromStringParameterName(
      this,
      parameterTitle,
      parameterName
    );
    return layerParameter.stringValue;
  }

  private getSpecificLayerArn(layerId: ResourceId, layerVersion: number) {
    const accountId =
      process.env.NODE_ENV === 'local'
        ? process.env.AWS_ACCOUNT_LOCAL
        : cdk.Aws.ACCOUNT_ID;
    const layerName = transformIdToResourceName(layerId, 'Layer');
    return `arn:aws:lambda:${cdk.Aws.REGION}:${accountId}:layer:${layerName}:${layerVersion}`;
  }
}
