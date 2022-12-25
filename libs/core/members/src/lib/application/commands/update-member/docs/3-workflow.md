# Feature Workflow: Update Member

## Algorithm

### Input
- UpdateMemberDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Get external record
3. Transform/validate external record
4. Save member
5. Return
   1. void
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input
- UpdateMemberDto

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
  transform UpdateMemberDto
  return findSourceDto
```

### Step 2. Get external record

#### Input
- findSourceDto

#### Output: Success

- MemberSource

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
If Member Not found
  return RepositoryItemNotFoundError
If Other
  return RepositoryServerError
Else
  return MemberSource
```

### Step 3. Transform/validate external record

#### Input
- MemberSource

#### Output: Success

- Member

#### Output: Fail

- SourceInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return SourceInvalidError
Else
  return Member
```

### Step 4. Save member

#### Input
- Member

#### Output: Success

- void

#### Output: Fail

- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Save Member
If Fails
  return RepositoryServerError
Else
  return void
```

### Step 5A. Return success

- void

### Step 5B. Or Error

- Return Error as is
