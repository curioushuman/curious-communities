import * as cdk from 'aws-cdk-lib';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import { ChLayer } from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

export class CcCoreLayersStack extends cdk.Stack {
  constructor(scope: cdk.App, stackId: string, props?: cdk.StackProps) {
    super(scope, stackId, props);

    const fileLocation = '../../../dist/shared/layers';

    new ChLayer(this, 'cc-groups-service', { fileLocation });
    new ChLayer(this, 'cc-members-service', { fileLocation });
  }
}
