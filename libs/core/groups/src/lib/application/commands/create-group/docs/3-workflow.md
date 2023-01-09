# Feature Workflow: Create Group

## Algorithm

### Input
- CreateGroupDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Build group record from DTO
2. Save group
3. Return
   1. Saved group
   2. Error

## Steps, detail

### Step 1. Build group record from DTO

#### Input
- CreateGroupDto

#### Output: Success

- Group

#### Output: Fail

- SourceInvalidError

#### Steps (pseudocode)

```
Build Group from Source
If invalid
  Return SourceInvalidError
Build Group from Group
If invalid
  Return SourceInvalidError
Build Group from Group
If invalid
  Return SourceInvalidError
Return Group
```

### Step 2. Save group

#### Input
- Group

#### Output: Success

- Saved group

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

- Saved group

### Step 5B. Or Error

- Return Error as is
