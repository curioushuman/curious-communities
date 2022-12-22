import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';

/**
 * Props required to initialize lambda
 */
export interface LambdaProps {
  lambdaEntry: string;
  lambdaProps: NodejsFunctionProps;
}
