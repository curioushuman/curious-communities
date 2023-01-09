# Feature Summary: Create Group

## 1. Details

- **Subdomain**: Groups
- **Aggregate root**: Groups

## 2. Data
### Input data:

- CreateGroupDto

### Dependencies (from other services/sources)

- None

### Output (results, events, errors)

#### Success (singular result + event)

- Saved group

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

- Group created

## 4. Decisions

- none

## 5. Open Questions/actions

- Attribution of author
