import { Capture, Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';

import { GroupsStack } from '../groups.stack';

/**
 * Unit test
 *
 * Tests the CloudFormation template generated by the CDK
 */

describe('GroupsStack', () => {
  let app: cdk.App;
  let stack: GroupsStack;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App();
    stack = new GroupsStack(app, 'GroupsStack');
    template = Template.fromStack(stack);
  });

  describe('Should contain a lambda for creating groups', () => {
    const layers = new Capture();

    it('Should exist', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'CcGroupsGroupCreateLambda',
        Layers: layers,
      });
    });

    it('Should have 3 layers attached', () => {
      expect(layers.asArray()).toHaveLength(3);
    });

    // TODO: additional tests for the lambda
    // TODO: test RE subscribed to event with the correct rule details
  });

  describe('Should contain a lambda for updating groups', () => {
    const layers = new Capture();

    it('Should exist', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'CcGroupsGroupUpdateLambda',
        Layers: layers,
      });
    });

    it('Should have 3 layers attached', () => {
      expect(layers.asArray()).toHaveLength(3);
    });

    // TODO: additional tests for the lambda
    // TODO: test RE subscribed to event with the correct rule details
  });

  describe('Should contain a lambda for creating participants', () => {
    const layers = new Capture();

    it('Should exist', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'CcGroupsGroupMemberCreateLambda',
        Layers: layers,
      });
    });

    it('Should have 3 layers attached', () => {
      expect(layers.asArray()).toHaveLength(3);
    });

    // TODO: additional tests for the lambda
    // TODO: test RE subscribed to event with the correct rule details
  });

  describe('Should contain a lambda for updating participants', () => {
    const layers = new Capture();

    it('Should exist', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'CcGroupsGroupMemberUpdateLambda',
        Layers: layers,
      });
    });

    it('Should have 3 layers attached', () => {
      expect(layers.asArray()).toHaveLength(3);
    });

    // TODO: additional tests for the lambda
    // TODO: test RE subscribed to event with the correct rule details
  });
});
