# Feature Summary: Update Member

## 1. Details

- **Subdomain**: Members
- **Aggregate root**: Members

## 2. Data
### Input data:

- UpdateMemberSourceDto

### Dependencies (from other services/sources)

- None

### Output (results, events, errors)

#### Success (singular result + event)

- Saved member source

### Failure (1+):

- RequestInvalidError
- InternalError

## 3. Behaviour

### Triggered by

- Application infrastructure layer

### Side-effects

- Member source updated

## 4. Decisions

- none

## 5. Open Questions/actions

- none
