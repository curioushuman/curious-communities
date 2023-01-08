# Feature Summary: Create Member

## 1. Details

- **Subdomain**: Members
- **Aggregate root**: Members

## 2. Data
### Input data:

- CreateMemberSourceDto

### Dependencies (from other services/sources)

- None

### Output (results, events, errors)

#### Success (singular result + event)

- Saved member source

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

- MemberSource created

## 4. Decisions

- none

## 5. Open Questions/actions

- Attribution of author
