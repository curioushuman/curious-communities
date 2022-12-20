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

1. Create course
2. Return
   1. void
   2. Or Error

## Steps, detail

### Step 1. Create course

#### Input

- CreateCourseRequestDto

#### Output: Success

- void

#### Output: Fail

- RepositoryServerUnavailableError
  - Extends ServiceUnavailableException
- RepositoryAuthenticationError
  - Extends UnauthorizedException
- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Create Course
If Error
  return Error
Else
  return
```

### Step 2A. Return success

### Step 2B. Or error
