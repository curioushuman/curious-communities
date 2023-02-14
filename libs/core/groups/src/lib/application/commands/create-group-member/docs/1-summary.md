# Feature Summary: Create GroupMember

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Groups

## 2. Data
### Input data:

- CreateGroupMemberDto

### Dependencies (from other services/sources)

- None

### Output (results, events, errors)

#### Success (singular result + event)

- Saved groupMember

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

- GroupMember created

## 4. Decisions

- none

## 5. Open Questions/actions

- Attribution of author
