# Feature Workflow: Update GroupMemberSource

## Algorithm

### Input
- UpdateGroupMemberSourceDto

### Output

#### Success

- Saved group source

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Prepare updated GroupMemberSource from group and groupSource
4. Save group source
5. Return
   1. Saved group source
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input
- UpdateGroupMemberSourceDto

#### Output: Success

- UpdateGroupMemberSourceDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return UpdateGroupMemberSourceDto
```

### Step 2. Prepare updated GroupMemberSource from group and groupSource

#### Input
- UpdateGroupMemberSourceDto

#### Output: Success

- GroupMemberSource

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Either object invalid
  return RequestInvalidError
Overwrite groupSource with group
return updated GroupMemberSource
```

### Step 3. Save group source

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
  return Saved group source
```

### Step 5A. Return success

- Saved group source

### Step 5B. Or Error

- Return Error as is
