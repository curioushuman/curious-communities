# Feature Summary: Create GroupMember

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: GroupMembers

## 2. Data

### Input data:

- CreateGroupMemberRequestDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- void

### Failure (1+):

- Various internal errors
  - See Application for more info

## 3. Behaviour

### Triggered by

- Lambda function(s)

### Side-effects

- GroupMember created

## 4. Decisions

- None

## 5. Open Questions/actions

- None
