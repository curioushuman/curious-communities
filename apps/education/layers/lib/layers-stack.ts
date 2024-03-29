import * as cdk from 'aws-cdk-lib';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  ChLayer,
  generateCompositeResourceId,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

export class CcEducationLayersStack extends cdk.Stack {
  constructor(scope: cdk.App, stackId: string, props?: cdk.StackProps) {
    super(scope, stackId, props);

    const fileLocation = '../../../dist/shared/layers';

    const coursesServiceLayerId = 'cc-courses-service';
    new ChLayer(this, coursesServiceLayerId, { fileLocation });
  }
}
