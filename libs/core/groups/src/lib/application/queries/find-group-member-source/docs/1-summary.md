# Feature Summary: Find GroupMember Source

## 1. Details

- **Subdomain**: GroupMembers
- **Aggregate root**: GroupMembers

## 2. Data

### Input data:

- FindGroupMemberSourceDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- GroupMemberSource

### Failure (1+):

- Various internal errors
  - See Application for more info

## 3. Behaviour

### Triggered by

- Lambda function(s)

### Side-effects

- None

## 4. Decisions

- None

## 5. Open Questions/actions

- None
