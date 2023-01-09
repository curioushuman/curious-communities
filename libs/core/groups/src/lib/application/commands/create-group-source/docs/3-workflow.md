# Feature Workflow: Create GroupSource

## Algorithm

### Input
- CreateGroupSourceDto

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
- CreateGroupSourceDto

#### Output: Success

- GroupSource

#### Output: Fail

- SourceInvalidError

#### Steps (pseudocode)

```
If invalid
  Return SourceInvalidError
Build GroupSource from Group
Return GroupSource
```

### Step 2. Save group source

#### Input
- GroupSource

#### Output: Success

- Saved group source

#### Output: Fail

- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Save GroupSource
If Fails
  return RepositoryServerError
Else
  return void
```

### Step 5A. Return success

- Saved group source

### Step 5B. Or Error

- Return Error as is
