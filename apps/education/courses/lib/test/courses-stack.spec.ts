import { Capture, Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';

import { CoursesStack } from '../courses.stack';

/**
 * Unit test
 *
 * Tests the CloudFormation template generated by the CDK
 */

describe('CoursesStack', () => {
  let app: cdk.App;
  let stack: CoursesStack;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App();
    stack = new CoursesStack(app, 'CoursesStack');
    template = Template.fromStack(stack);
  });

  describe('Should contain a lambda for creating courses', () => {
    const layers = new Capture();

    it('Should exist', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'AudioUeCreateCourseLambda',
        Layers: layers,
      });
    });

    it('Should have 3 layers attached', () => {
      expect(layers.asArray()).toHaveLength(3);
    });

    // TODO: additional tests for the lambda
  });
});