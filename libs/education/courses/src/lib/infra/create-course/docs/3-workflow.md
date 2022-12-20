# Feature Workflow: Create Course

## Algorithm

### Input

- CreateCourseRequestDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Create course
3. Return
   1. void
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- CreateCourseRequestDto

#### Output: Success

- DTO for createCourse command

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return createCourseDto
```

### Step 2. Create course

#### Input

- createCourseDto

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
Try to create course
  catch + return Error
Else
  return CourseSource
```

### Step 4A. Return success

- void

### Step 4B. Or Error

- Return Error as is
