# Feature Workflow: Upsert MemberSource

## Algorithm

### Input
- UpsertMemberSourceRequestDto

### Output

#### Success

- Saved member source

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Attempt to find MemberSource
3. If found, update; else, create
4. Transform member source to response dto
5. Return
   1. Saved member source
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input
- UpsertMemberSourceRequestDto

#### Output: Success

- UpsertMemberSourceRequestDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return UpsertMemberSourceRequestDto
```

### Step 2. Attempt to find MemberSource

#### Input
- UpsertMemberSourceRequestDto

#### Output: Success

- MemberSource OR null

#### Output: Fail

- Internal error
  - Various

#### Steps (pseudocode)

```
Prepare FindSourceDto
  Use sourceId if available
  Else try email
Find MemberSource
If found, return MemberSource
Else return null
```

### Step 3. Update or create

#### Input
- MemberSource OR null

#### Output: Success

- Saved member source

#### Output: Fail

- Internal error
  - Various

#### Steps (pseudocode)

```
If MemberSource found
  Update MemberSource
Else
  Create MemberSource
If error
  return error
Else
  return Saved member source
```

### Step 4. Transform to response dto

As it sounds

### Step 5A. Return success

- Saved member source

### Step 5B. Or Error

- Return Error as is
