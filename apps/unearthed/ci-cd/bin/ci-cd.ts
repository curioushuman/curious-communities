#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { resolve as pathResolve } from 'path';
import * as dotenv from 'dotenv';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  getAccountAndRegion,
  transformIdToResourceTitle,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

import { UeCiCdStack } from '../lib/ci-cd-stack';

const [account, region] = getAccountAndRegion();

// creating an app in cloud or local
const app = new cdk.App();
new UeCiCdStack(app, transformIdToResourceTitle('ue-ci-cd', 'Stack'), {
  env: {
    account,
    region,
  },
});
