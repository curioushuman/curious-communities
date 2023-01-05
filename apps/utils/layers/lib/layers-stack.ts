import * as cdk from 'aws-cdk-lib';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import { ChLayer } from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

export class LayersStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fileLocation = '../../../dist/utils/layers';

    new ChLayer(this, 'node-modules', { fileLocation });
    new ChLayer(this, 'shared', { fileLocation });
  }
}
