# Feature Workflow: Create Member

## Algorithm

### Input
- CreateMemberDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Build member record from DTO
2. Save member
3. Return
   1. Saved member
   2. Error

## Steps, detail

### Step 1. Build member record from DTO

#### Input
- CreateMemberDto

#### Output: Success

- Member

#### Output: Fail

- SourceInvalidError

#### Steps (pseudocode)

```
Build Member from Source
If invalid
  Return SourceInvalidError
Build Member from Member
If invalid
  Return SourceInvalidError
Build Member from Member
If invalid
  Return SourceInvalidError
Return Member
```

### Step 2. Save member

#### Input
- Member

#### Output: Success

- Saved member

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

- Saved member

### Step 5B. Or Error

- Return Error as is
