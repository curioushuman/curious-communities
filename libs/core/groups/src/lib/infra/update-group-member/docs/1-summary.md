# Feature Summary: Update GroupMember

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: GroupMembers

## 2. Data

### Input data:

- UpdateGroupMemberRequestDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- void

### Failure (1+):

- Various internal errors
  - See application docs for more info

## 3. Behaviour

### Triggered by

- Lambda function(s)

### Side-effects

- GroupMember created

## 4. Decisions

- None

## 5. Open Questions/actions

- None
