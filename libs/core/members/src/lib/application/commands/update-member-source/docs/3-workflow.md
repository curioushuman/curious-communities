# Feature Workflow: Update MemberSource

## Algorithm

### Input
- UpdateMemberSourceDto

### Output

#### Success

- Saved member source

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Prepare updated MemberSource from member and memberSource
4. Save member source
5. Return
   1. Saved member source
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input
- UpdateMemberSourceDto

#### Output: Success

- UpdateMemberSourceDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return UpdateMemberSourceDto
```

### Step 2. Prepare updated MemberSource from member and memberSource

#### Input
- UpdateMemberSourceDto

#### Output: Success

- MemberSource

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Either object invalid
  return RequestInvalidError
Overwrite memberSource with member
return updated MemberSource
```

### Step 3. Save member source

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
  return Saved member source
```

### Step 5A. Return success

- Saved member source

### Step 5B. Or Error

- Return Error as is
