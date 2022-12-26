# Feature Summary: Update GroupMember

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: GroupMembers

## 2. Data

### Input data:

- UpdateGroupMemberRequestDto

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

- None

## 5. Open Questions/actions

- None
