import { JestPrep } from './infra.preppers';
import { JestPrepProps } from './infra.types';

/**
 * Takes all necessary steps to prep for api testing
 */
export const prepApi = async (
  stackTitle: string,
  props: JestPrepProps
): Promise<void> => {
  const prep = new JestPrep(stackTitle, props);
  await prep.storeApiUrl();
};
