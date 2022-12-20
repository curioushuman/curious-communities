import * as lambda from 'aws-cdk-lib/aws-lambda';

/**
 * Props required to initialize a Layer Construct
 */
export interface ChLayerProps {
  fileLocation: string;
  layerProps?: Partial<lambda.LayerVersionProps>;
}
