import { prepApi } from '../../../../../tools/jest/infra.prep';

import { transformIdToResourceTitle } from '@curioushuman/cdk-utils';
import { JestPrepProps } from 'tools/jest/infra.types';

/**
 * For CommonJs Jest requires a single async function
 *
 * If you move to ES2022 or similar you can define a root level await
 */
const prep = async function () {
  const stackTitle = transformIdToResourceTitle('ue-api-admin', 'Stack');
  const prepProps: JestPrepProps = {
    localStackPath: 'apps/unearthed/api-admin',
  };
  await prepApi(stackTitle, prepProps);
};

prep();
