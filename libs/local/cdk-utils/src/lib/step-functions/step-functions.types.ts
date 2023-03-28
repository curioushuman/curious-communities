import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

export interface StateMachineEndStates {
  fail: sfn.Fail | string;
  success: sfn.Succeed | string;
}

/**
 * Props required to initialize lambda
 */
export interface StateMachineProps {
  endStates?: StateMachineEndStates;
}
