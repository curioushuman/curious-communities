# Feature Summary: Create Group

## 1. Details

- **Subdomain**: Groups
- **Aggregate root**: Groups

## 2. Data
### Input data:

- CreateGroupSourceDto

### Dependencies (from other services/sources)

- None

### Output (results, events, errors)

#### Success (singular result + event)

- Saved group source

### Failure (1+):

- RequestInvalidError
- RepositoryAuthenticationError
- RepositoryServerError
- RepositoryServerUnavailableError
- SourceInvalidError

## 3. Behaviour

### Triggered by

- Application infrastructure layer

### Side-effects

- GroupSource created

## 4. Decisions

- none

## 5. Open Questions/actions

- Attribution of author
