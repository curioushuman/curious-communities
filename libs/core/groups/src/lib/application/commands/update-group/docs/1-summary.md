# Feature Summary: Update Group

## 1. Details

- **Subdomain**: Groups
- **Aggregate root**: Groups

## 2. Data
### Input data:

- UpdateGroupDto

### Dependencies (from other services/sources)

- SourceRepo.findOne(ById)
  - We need to validate that a source object exists before we save it
  - We might as well grab the data while we're there

### Output (results, events, errors)

#### Success (singular result + event)

- Saved group

### Failure (1+):

- RequestInvalidError
- RepositoryAuthenticationError
- RepositoryItemNotFoundError
- RepositoryServerError
- RepositoryServerUnavailableError
- SourceInvalidError
- RepositoryItemConflictError

## 3. Behaviour

### Triggered by

- Application infrastructure layer

### Side-effects

- Group updated

## 4. Decisions

- none

## 5. Open Questions/actions

- none
