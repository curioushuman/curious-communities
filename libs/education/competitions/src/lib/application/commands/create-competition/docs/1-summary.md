# Feature Summary: Create Competition

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Competitions

## 2. Data
### Input data:

- CreateCompetitionDto

### Dependencies (from other services/sources)

- SourceRepo.findOne(ById)
  - We need to validate that a source object exists before we save it
  - We might as well grab the data while we're there

### Output (results, events, errors)

#### Success (singular result + event)

- void

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

- Competition created
- External record updated with competition ID

## 4. Decisions

- none

## 5. Open Questions/actions

- Attribution of author
