# Feature Summary: Create Competition

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Competitions

## 2. Data

### Input data:

- CreateCompetitionRequestDto

### Dependencies (from other services/sources)

- None, all internal

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

- Lambda function(s)

### Side-effects

- Competition created
- External record updated with competition ID

## 4. Decisions

- None

## 5. Open Questions/actions

- None
