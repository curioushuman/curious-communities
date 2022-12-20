#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  getAccountAndRegion,
  transformIdToResourceTitle,
  transformIdToTestResourceTitle,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import { ApiAdminStack } from '../lib/api-admin.stack';
import { ApiAdminTestStack } from '../lib/test/api-admin-test.stack';

const [account, region] = getAccountAndRegion();

// creating an app in cloud or local
const app = new cdk.App();
const stackId = 'ue-api-admin';
new ApiAdminStack(app, transformIdToResourceTitle(stackId, 'Stack'), {
  env: {
    account,
    region,
  },
});
if (process.env.NODE_ENV !== 'production') {
  new ApiAdminTestStack(app, transformIdToTestResourceTitle(stackId, 'Stack'), {
    env: {
      account,
      region,
    },
  });
}
