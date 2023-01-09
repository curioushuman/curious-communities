# Feature Workflow: Upsert GroupSource

## Algorithm

### Input
- UpsertGroupSourceRequestDto

### Output

#### Success

- Saved group source

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Attempt to find GroupSource
3. If found, update; else, create
4. Transform group source to response dto
5. Return
   1. Saved group source
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input
- UpsertGroupSourceRequestDto

#### Output: Success

- UpsertGroupSourceRequestDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return UpsertGroupSourceRequestDto
```

### Step 2. Attempt to find GroupSource

#### Input
- UpsertGroupSourceRequestDto

#### Output: Success

- GroupSource OR null

#### Output: Fail

- Internal error
  - Various

#### Steps (pseudocode)

```
Prepare FindSourceDto
  Use sourceId if available
  Else try email
Find GroupSource
If found, return GroupSource
Else return null
```

### Step 3. Update or create

#### Input
- GroupSource OR null

#### Output: Success

- Saved group source

#### Output: Fail

- Internal error
  - Various

#### Steps (pseudocode)

```
If GroupSource found
  Update GroupSource
Else
  Create GroupSource
If error
  return error
Else
  return Saved group source
```

### Step 4. Transform to response dto

As it sounds

### Step 5A. Return success

- Saved group source

### Step 5B. Or Error

- Return Error as is
