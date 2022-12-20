# Feature Summary: Create Course

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data

### Input data:

- CreateCourseRequestDto

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

- Course created
- External record updated with course ID

## 4. Decisions

- None

## 5. Open Questions/actions

- None
