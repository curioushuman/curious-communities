# Feature Workflow: Update Group

## Algorithm

### Input
- UpdateGroupDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Get external record
3. Transform/validate external record
4. Save group
5. Return
   1. void
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input
- UpdateGroupDto

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
  transform UpdateGroupDto
  return findSourceDto
```

### Step 2. Get external record

#### Input
- findSourceDto

#### Output: Success

- GroupSource

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
If Group Not found
  return RepositoryItemNotFoundError
If Other
  return RepositoryServerError
Else
  return GroupSource
```

### Step 3. Transform/validate external record

#### Input
- GroupSource

#### Output: Success

- Group

#### Output: Fail

- SourceInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return SourceInvalidError
Else
  return Group
```

### Step 4. Save group

#### Input
- Group

#### Output: Success

- void

#### Output: Fail

- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Save Group
If Fails
  return RepositoryServerError
Else
  return void
```

### Step 5A. Return success

- void

### Step 5B. Or Error

- Return Error as is
