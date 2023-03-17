# Course

## Creating / updating a course in the system

#### NOTES

* If a course is updated externally, but does not yet exist in the system, it will be created

<img src="../apps/api/admin/diagrams/api-admin.png" width="200" />
<img src="../apps/education/courses/diagrams/course-upsert.png" width="300" />

<font color="green">Tested!</font>

## Opening a course in the system

Daily scheduled check for courses that are open today

#### NOTES

* This will invoke the functions that follow a course-update (outlined below) e.g. groups will become active, group members will be created, etc.

<img src="../apps/education/courses/diagrams/courses-open.png" width="300" />

## Events based on course creation

### Groups

A corresponding group will be created in the system, and in related sources.

<img src="../apps/core/groups/diagrams/course-group-upsert.png" width="400" />
<img src="../apps/core/groups/diagrams/group-sources-upsert.png" width="400" />

<font color="green">Tested!</font>

### Participants / group members

The system will check for the existence of external participants and add them to the system.

#### NOTES

* Members are created, if they don't already exist, as part of participant upsert
* If a course is not yet open, or a participant has an inactive status, group member sources will not be created
* However, if both course and participant are active, group member source will be immediately created and access will be immediately granted

<img src="../apps/education/courses/diagrams/participants-upsert.png" width="300" />
<img src="../apps/education/courses/diagrams/participant-upsert.png" width="400" />
<img src="../apps/core/groups/diagrams/course-group-member-upsert.png" width="400" />
<img src="../apps/core/groups/diagrams/group-member-sources-upsert.png" width="300" />

## Events based on course update

### Groups / group members

The group will be updated, which will cause the group sources to be updated AND the group members to be updated; both with new course/group info. Group member sources again will only be affected if course/group and participant/group member statuses are active.

<img src="../apps/core/groups/diagrams/course-group-upsert.png" width="400" />
<img src="../apps/core/groups/diagrams/group-sources-upsert.png" width="400" />
<img src="../apps/core/groups/diagrams/group-members-update.png" width="300" />
<img src="../apps/core/groups/diagrams/group-member-sources-upsert.png" width="300" />

### Participants / group members

This feels like a potential conflict of the previous, but the only info group members are receiving from participants is the status. As this (path for) change is invoked by an update in the course, the group-member-update will result in a `no-change` outcome and therefore will not invoke a group-member-source-upsert.

<img src="../apps/education/courses/diagrams/participants-update.png" width="300" />
<img src="../apps/core/groups/diagrams/course-group-member-upsert.png" width="400" />
<img src="../apps/core/groups/diagrams/group-members-update.png" width="300" />

## Schedule check for change in course status

i.e. is today the day that the course opens.

TBD

# Participant

## Creating / updating a participant in the system

#### NOTES

* If a participant is updated externally, but does not yet exist in the system, it will be created

<img src="../apps/api/admin/diagrams/api-admin.png" width="200" />
<img src="../apps/education/courses/diagrams/participant-upsert.png" width="400" />

## Events based on participant creation or update

### Members

<img src="../apps/core/members/diagrams/member-sources-upsert.png" width="500" />

### Group members

#### NOTES

* If a course is not yet open, or a participant has an inactive status, group member sources will not be created
* However, if both course and participant are active, group member source will be immediately created and access will be immediately granted

<img src="../apps/core/groups/diagrams/course-group-member-upsert.png" width="400" />
<img src="../apps/core/groups/diagrams/group-member-sources-upsert.png" width="300" />

# Member

## Creating a member in the system

Currently only occurs as part of participant-upsert.

## Updating a member in the system

<img src="../apps/api/admin/diagrams/api-admin.png" width="200" />
<img src="../apps/core/members/diagrams/member-update.png" width="400" />
<img src="../apps/core/members/diagrams/member-sources-upsert.png" width="500" />

## Events based on member update

Essentially the member info is pushed to all micro-services that use the member entity.

### Participants

<img src="../apps/education/courses/diagrams/participants-update.png" width="300" />

### Group members

<img src="../apps/core/groups/diagrams/group-members-update.png" width="300" />

