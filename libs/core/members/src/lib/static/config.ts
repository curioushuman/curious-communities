import { memberSources } from '@curioushuman/common';

export default {
  defaults: {
    accountOwner: 'partner',
    accountSources: memberSources,
    accountOrigins: ['CRM'],
    accountDestinations: ['AUTH', 'COMMUNITY', 'MICRO-COURSE'],
    primaryAccountSource: 'CRM',
    memberStatus: 'active',
  },
};
