# Feature Summary: Create Participant

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data
### Input data:

- CreateParticipantDto

### Dependencies (from other services/sources)

- None

### Output (results, events, errors)

#### Success (singular result + event)

- Saved participant

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

- Participant created

## 4. Decisions

- none

## 5. Open Questions/actions

- Attribution of author
