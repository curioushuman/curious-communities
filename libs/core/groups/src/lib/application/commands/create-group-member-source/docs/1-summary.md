# Feature Summary: Create GroupMember

## 1. Details

- **Subdomain**: GroupMembers
- **Aggregate root**: GroupMembers

## 2. Data
### Input data:

- CreateGroupMemberSourceDto

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

- GroupMemberSource created

## 4. Decisions

- none

## 5. Open Questions/actions

- Attribution of author
