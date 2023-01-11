# Feature Workflow: Create GroupMemberSource

## Algorithm

### Input
- CreateGroupMemberSourceDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Build group source record from DTO.group
2. Save group source
3. Return
   1. Saved group source
   2. Error

## Steps, detail

### Step 1. Build group source record from DTO

#### Input
- CreateGroupMemberSourceDto

#### Output: Success

- GroupMemberSource

#### Output: Fail

- SourceInvalidError

#### Steps (pseudocode)

```
If invalid
  Return SourceInvalidError
Build GroupMemberSource from GroupMember
Return GroupMemberSource
```

### Step 2. Save group source

#### Input
- GroupMemberSource

#### Output: Success

- Saved group source

#### Output: Fail

- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Save GroupMemberSource
If Fails
  return RepositoryServerError
Else
  return void
```

### Step 5A. Return success

- Saved group source

### Step 5B. Or Error

- Return Error as is
