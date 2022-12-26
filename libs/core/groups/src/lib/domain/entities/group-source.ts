import { Record, Static } from 'runtypes';

import { Timestamp } from '@curioushuman/common';

import { GroupSourceStatus } from '../value-objects/group-source-status';
import { GroupId } from '../value-objects/group-id';
import { GroupSourceName } from '../value-objects/group-source-name';

export const GroupSource = Record({
  id: GroupId,
  status: GroupSourceStatus,
  name: GroupSourceName,
  dateOpen: Timestamp,
  dateClosed: Timestamp,
});

export type GroupSource = Static<typeof GroupSource>;
