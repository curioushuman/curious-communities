# Feature Summary: Update GroupMember

## 1. Details

- **Subdomain**: GroupMembers
- **Aggregate root**: GroupMembers

## 2. Data
### Input data:

- UpdateGroupMemberSourceDto

### Dependencies (from other services/sources)

- None

### Output (results, events, errors)

#### Success (singular result + event)

- Saved group source

### Failure (1+):

- RequestInvalidError
- InternalError

## 3. Behaviour

### Triggered by

- Application infrastructure layer

### Side-effects

- GroupMember source updated

## 4. Decisions

- none

## 5. Open Questions/actions

- none
