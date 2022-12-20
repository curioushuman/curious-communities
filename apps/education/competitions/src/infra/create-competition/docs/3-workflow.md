# Feature Workflow: Create Competition

## Algorithm

### Input

- CreateCompetitionRequestDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Create competition
2. Return
   1. void
   2. Or Error

## Steps, detail

### Step 1. Create competition

#### Input

- CreateCompetitionRequestDto

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
Create Competition
If Error
  return Error
Else
  return
```

### Step 2A. Return success

### Step 2B. Or error
