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

1. Validate input
2. Create competition
3. Return
   1. void
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- CreateCompetitionRequestDto

#### Output: Success

- DTO for createCompetition command

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return createCompetitionDto
```

### Step 2. Create competition

#### Input

- createCompetitionDto

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
Try to create competition
  catch + return Error
Else
  return CompetitionSource
```

### Step 4A. Return success

- void

### Step 4B. Or Error

- Return Error as is
