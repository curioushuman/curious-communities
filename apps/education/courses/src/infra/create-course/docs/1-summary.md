# Feature Summary: Create Course

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data

### Input data:

- CreateCourseRequestDto

### Dependencies (from other services/sources)

- CoCourses/Layer

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

- SNS subscription

### Side-effects

- Course created
- External record updated with course ID

## 4. Decisions

- We only support (creation of cc-courses in) external systems for now
  - In the future we might expand to allow them to use our own
- External record info not updatable from custom admin
- NO extra data administer-able from our admin
  - Only aspects such as groups etc

## 5. Open Questions/actions

- None
