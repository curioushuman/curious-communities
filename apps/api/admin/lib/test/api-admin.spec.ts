import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';

import { ApiAdminStack } from '../api-admin.stack';

/**
 * Unit test
 *
 * Tests the CloudFormation template generated by the CDK
 */

describe('ApiAdminStack', () => {
  let app: cdk.App;
  let stack: ApiAdminStack;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App();
    stack = new ApiAdminStack(app, 'ApiAdminStack');
    template = Template.fromStack(stack);
  });

  it('Should contain an API', () => {
    template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
  });
});
