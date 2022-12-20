import { readFileSync } from 'fs';
import { resolve } from 'path';
// import {
//   APIGatewayClient,
//   GetRestApisCommand,
// } from '@aws-sdk/client-api-gateway';

import { JestPrepProps, JestPrepStrategy } from './infra.types';

/**
 * Prepping for local AND remote testing (for now)
 *
 * Notes
 * - Obtains required info from the cdk-outputs.json
 * - Both cdklocal and cdk are able to output to file
 *
 * TODO
 * - [ ] would be better if we made this more functional
 */
class LocalPrepStrategy implements JestPrepStrategy {
  constructor(public stackTitle: string, public props: JestPrepProps) {}
  async getApiUrl() {
    const pathLocal = resolve(
      __dirname,
      '../../dist',
      this.props.localStackPath
    );
    const outputsRaw = readFileSync(
      resolve(pathLocal, 'cdk-outputs.json'),
      'utf-8'
    );
    const outputsJson = JSON.parse(outputsRaw);
    const outputsStack = outputsJson[this.stackTitle] || {};
    let apiUrl = '';
    for (const key in outputsStack) {
      if (key.includes('apiUrl')) {
        apiUrl = outputsStack[key];
      }
    }
    return apiUrl;
  }
}

/**
 * Prepping for remote testing
 *
 * We (may in the future) need to reach out to AWS to obtain the info we need
 *
 * TODO
 * - [*] is there a better/simpler way
 *       there IS an easier way, it is to output to local file :P
 *       so this class is currently no longer necessary
 */
// class AwsPrepStrategy implements JestPrepStrategy {
//   constructor(public stackTitle: string, public props: JestPrepProps) {}
//   async getApiUrl() {
//     const client = new APIGatewayClient({ region: process.env.AWS_REGION });
//     const command = new GetRestApisCommand({});
//     try {
//       const response = await client.send(command);

//       // TODO: need to loop through the results to find the one we want
//       console.log(response);
//     } catch (error) {
//       console.log(error);
//     }
//     return 'maybe later';
//   }
// }

const strategyMap = {
  local: LocalPrepStrategy,
  hybrid: LocalPrepStrategy,
  develop: LocalPrepStrategy,
  staging: LocalPrepStrategy,
  production: LocalPrepStrategy,
};

type NodeEnvironment = keyof typeof strategyMap;

export class JestPrep {
  public strategy: JestPrepStrategy;

  constructor(public stackTitle: string, props: JestPrepProps) {
    const env = (process.env.NODE_ENV || 'local') as NodeEnvironment;
    if (!(env in strategyMap)) {
      throw new Error(`Unsupported NODE_ENV: ${env}`);
    }
    this.strategy = new strategyMap[env](stackTitle, props);
  }

  async getApiUrl() {
    return await this.strategy.getApiUrl();
  }

  async storeApiUrl() {
    const envKey = `${this.stackTitle}_ApiUrl`;
    const apiUrl = await this.getApiUrl();
    process.env[envKey] = apiUrl;
  }
}
