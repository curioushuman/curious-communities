# Feature Workflow: Create MemberSource

## Algorithm

### Input
- CreateMemberSourceDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Build member source record from DTO.member
2. Save member source
3. Return
   1. Saved member source
   2. Error

## Steps, detail

### Step 1. Build member source record from DTO

#### Input
- CreateMemberSourceDto

#### Output: Success

- MemberSource

#### Output: Fail

- SourceInvalidError

#### Steps (pseudocode)

```
If invalid
  Return SourceInvalidError
Build MemberSource from Member
Return MemberSource
```

### Step 2. Save member source

#### Input
- MemberSource

#### Output: Success

- Saved member source

#### Output: Fail

- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Save MemberSource
If Fails
  return RepositoryServerError
Else
  return void
```

### Step 5A. Return success

- Saved member source

### Step 5B. Or Error

- Return Error as is
