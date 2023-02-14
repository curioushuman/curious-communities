# Feature Workflow: Create GroupMember

## Algorithm

### Input
- CreateGroupMemberDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Build groupMember record from DTO
2. Save groupMember
3. Return
   1. Saved groupMember
   2. Error

## Steps, detail

### Step 1. Build groupMember record from DTO

#### Input
- CreateGroupMemberDto

#### Output: Success

- GroupMember

#### Output: Fail

- SourceInvalidError

#### Steps (pseudocode)

```
Build GroupMember from Source
If invalid
  Return SourceInvalidError
Build GroupMember from Group
If invalid
  Return SourceInvalidError
Build GroupMember from Member
If invalid
  Return SourceInvalidError
Return GroupMember
```

### Step 2. Save groupMember

#### Input
- GroupMember

#### Output: Success

- Saved groupMember

#### Output: Fail

- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Save GroupMember
If Fails
  return RepositoryServerError
Else
  return void
```

### Step 5A. Return success

- Saved groupMember

### Step 5B. Or Error

- Return Error as is
