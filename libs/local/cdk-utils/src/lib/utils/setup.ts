import { resolve as pathResolve } from 'path';
import * as dotenv from 'dotenv';

/**
 * Default backups for account and region
 */
const LOCAL_ACCOUNT = '000000000000' as const;
const DEFAULT_REGION = 'ap-southeast-2' as const;

/**
 * Retrieve and store the relevant account and region values
 *
 * TODO
 * - [ ] set better types for account and region
 */
export const getAccountAndRegion = (): [string, string] => {
  // these will pick up whatever profile you run your CDK commands with
  // see aw cli configuration
  let account = process.env.CDK_DEFAULT_ACCOUNT;
  let region = process.env.CDK_DEFAULT_REGION;

  // this will pick up our local environment vars
  if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'hybrid') {
    // cwd will be the app root
    dotenv.config({ path: pathResolve(process.cwd(), '../../../.env') });
    account = process.env.AWS_ACCOUNT_LOCAL;
    region = process.env.AWS_DEFAULT_REGION;
  }

  return [account || LOCAL_ACCOUNT, region || DEFAULT_REGION];
};
