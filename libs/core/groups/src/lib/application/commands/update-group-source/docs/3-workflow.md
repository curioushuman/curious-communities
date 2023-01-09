# Feature Workflow: Update GroupSource

## Algorithm

### Input
- UpdateGroupSourceDto

### Output

#### Success

- Saved group source

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Prepare updated GroupSource from group and groupSource
4. Save group source
5. Return
   1. Saved group source
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input
- UpdateGroupSourceDto

#### Output: Success

- UpdateGroupSourceDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return UpdateGroupSourceDto
```

### Step 2. Prepare updated GroupSource from group and groupSource

#### Input
- UpdateGroupSourceDto

#### Output: Success

- GroupSource

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Either object invalid
  return RequestInvalidError
Overwrite groupSource with group
return updated GroupSource
```

### Step 3. Save group source

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
  return Saved group source
```

### Step 5A. Return success

- Saved group source

### Step 5B. Or Error

- Return Error as is
