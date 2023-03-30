import * as cdk from 'aws-cdk-lib';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import { ChLayer } from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

export class LayersStack extends cdk.Stack {
  constructor(scope: cdk.App, stackId: string, props?: cdk.StackProps) {
    super(scope, stackId, props);

    const fileLocation = '../../../dist/shared/layers';

    const nodeModulesLayerId = 'node-modules';
    new ChLayer(this, nodeModulesLayerId, { fileLocation });
    const sharedLayerId = 'shared';
    new ChLayer(this, sharedLayerId, { fileLocation });
  }
}
