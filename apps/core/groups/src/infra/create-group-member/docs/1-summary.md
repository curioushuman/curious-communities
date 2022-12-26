# Feature Summary: Create GroupMember

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: GroupMembers

## 2. Data

### Input data:

- CreateGroupMemberRequestDto

### Dependencies (from other services/sources)

- /libs/education/group-members

### Output (results, events, errors)

#### Success (singular result + event)

- void

### Failure (1+):

- Various internal errors
  - See ~/libs/education/group-members/src/lib/application docs for more info

## 3. Behaviour

### Triggered by

- Eventbridge subscription

### Side-effects

- GroupMember created

## 4. Decisions

- We only support (creation of cc-group-members in) external systems for now
  - In the future we might expand to allow them to use our own
- External record info not updatable from custom admin
- NO extra data administer-able from our admin
  - Only aspects such as group-members etc

## 5. Open Questions/actions

- None
