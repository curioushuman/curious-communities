import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

// Importing utilities for use in infrastructure processes
// Initially we're going to import from local sources
import {
  resourceNameTitle,
  transformIdToResourceTitle,
} from '../../../../dist/local/@curioushuman/cdk-utils/src';
// Long term we'll put them into packages
// import { CoApiConstruct } from '@curioushuman/cdk-utils';

/**
 * Currently creates OpenId identity provider for GitHub
 *
 * TODO
 * - [ ] move the GitHub OpenId identity provider to a construct in the cdk-utils package
 */
export class UeCiCdStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * GitHub details for OpenId identity provider
     */
    const githubDomain = 'token.actions.githubusercontent.com';
    const githubClientId = 'sts.amazonaws.com';

    /**
     * Repositories we're granting access to
     */
    const repositories = [
      { owner: 'curioushuman', repo: 'curious-communities', filter: 'main' },
    ];

    /**
     * OpenId identity provider for GitHub
     */
    const providerTitle = transformIdToResourceTitle('ue-ci-cd', 'Stack');
    const githubProvider = new iam.OpenIdConnectProvider(this, providerTitle, {
      url: `https://${githubDomain}`,
      clientIds: [githubClientId],
    });

    /**
     * Condition for GitHub OpenId identity provider
     */
    const iamRepoDeployAccess = repositories.map(
      (r) => `repo:${r.owner}/${r.repo}:${r.filter ?? '*'}`
    );
    const conditions: iam.Conditions = {
      StringLike: {
        [`${githubDomain}:sub`]: iamRepoDeployAccess,
      },
    };

    /**
     * Role for GitHub OpenId identity provider
     */
    const [roleName, roleTitle] = resourceNameTitle('ue-ci-cd', 'Role');
    new iam.Role(this, roleTitle, {
      roleName,
      assumedBy: new iam.WebIdentityPrincipal(
        githubProvider.openIdConnectProviderArn,
        conditions
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
      ],
      description:
        'This role is used via GitHub Actions to deploy with AWS CDK on the target AWS account',
      maxSessionDuration: cdk.Duration.hours(1),
    });
  }
}
