# Feature Workflow: Update Course

## Algorithm

### Input
- UpdateCourseDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Get external record
3. Transform/validate external record
4. Save course
5. Return
   1. void
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input
- UpdateCourseDto

#### Output: Success

- findSourceDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  transform UpdateCourseDto
  return findSourceDto
```

### Step 2. Get external record

#### Input
- findSourceDto

#### Output: Success

- CourseSource

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
If Source Not found
  return RepositoryItemNotFoundError
If Course Not found
  return RepositoryItemNotFoundError
If Other
  return RepositoryServerError
Else
  return CourseSource
```

### Step 3. Transform/validate external record

#### Input
- CourseSource

#### Output: Success

- Course

#### Output: Fail

- SourceInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return SourceInvalidError
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
