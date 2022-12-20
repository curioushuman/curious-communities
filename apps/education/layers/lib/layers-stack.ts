import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import { ChLayer } from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

export class UeLayersStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fileLocation = '../../../dist/layers';

    new ChLayer(this, 'ue-courses-service', { fileLocation });
  }
}
