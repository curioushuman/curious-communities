NOTE: Unfinished

# Feature Workflow: Create Competition

## Algorithm

### Input
- ExternalEvent
  - Competition status updated to Open

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Receive event
2. Create competition in admin
3. Sync artists to admin
4. Sync artists to search
5. Return
   1. void
   2. Error

## Steps, detail

### Step 1. Receive event

#### Input
- EventType
- CompetitionSourceId
- UpdatedStatus?

#### Output: Success

- return 200

##### Event: external events topic

Attributes: object=competition, type={EventType}
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

### Step 2. Create competition in admin

#### Input
- CompetitionId

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
  Create competition
  return void
```

### Step 3. Sync artists to admin

#### Input
- CompetitionId
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
  return Competition
```

### Step 4. Save competition

#### Input
- Competition

#### Output: Success

- void

#### Output: Fail

- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Save Competition
If Fails
  return RepositoryServerError
Else
  return void
```

### Step 5A. Return success

- void

### Step 5B. Or Error

- Return Error as is
