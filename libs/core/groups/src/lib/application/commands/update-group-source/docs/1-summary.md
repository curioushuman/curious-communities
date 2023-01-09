# Feature Summary: Update Group

## 1. Details

- **Subdomain**: Groups
- **Aggregate root**: Groups

## 2. Data
### Input data:

- UpdateGroupSourceDto

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

- Group source updated

## 4. Decisions

- none

## 5. Open Questions/actions

- none
