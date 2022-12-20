NOTE: Unfinished

# Feature Workflow: Create Course

## Algorithm

### Input
- ExternalEvent
  - Course status updated to Open

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Receive event
2. Create course in admin
3. Sync artists to admin
4. Sync artists to search
5. Return
   1. void
   2. Error

## Steps, detail

### Step 1. Receive event

#### Input
- EventType
- CourseSourceId
- UpdatedStatus?

#### Output: Success

- return 200

##### Event: external events topic

Attributes: object=course, type={EventType}
Data: ExternalEventDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  create (internal) event
  return 200
```

### Step 2. Create course in admin

#### Input
- CourseId

#### Output: Success

- void

#### Output: Fail

- RepositoryServerUnavailableError
  - Extends ServiceUnavailableException
- RepositoryAuthenticationError
  - Extends UnauthorizedException
- RepositoryItemNotFoundError
  - Extends NotFoundException
- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
If Unable to connect
  return RepositoryServerUnavailableError
If Unable to authenticate
  return RepositoryAuthenticationError
If Not found
  return RepositoryItemNotFoundError
If Other
  return RepositoryServerError
Else
  Create course
  return void
```

### Step 3. Sync artists to admin

#### Input
- CourseId
- NextToken

#### Output: Success

- NextToken
- OR void

#### Output: Fail

- SourceInvalidError
  - Extends BadRequestException
- RepositoryItemConflictError
  - Extends ConflictException

#### Steps (pseudocode)

```
If Invalid
  return SourceInvalidError
If Already associated
  return SourceInvalidError
If Exists
  return RepositoryItemConflictError
Else
  return Course
```

### Step 4. Save course

#### Input
- Course

#### Output: Success

- void

#### Output: Fail

- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Save Course
If Fails
  return RepositoryServerError
Else
  return void
```

### Step 5A. Return success

- void

### Step 5B. Or Error

- Return Error as is
