# Feature Workflow: Find Group Source

## Algorithm

### Input

- FindGroupSourceDto

### Output

#### Success

- GroupSource

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Find group source
3. Return
   1. GroupSource
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- FindGroupSourceDto

#### Output: Success

- FindGroupSourceDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return FindGroupSourceDto
```

### Step 2. Find group source

#### Input

- FindGroupSourceDto

#### Output: Success

- GroupSource

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to find group source
  catch + return Error
Else
  return GroupSource
```

### Step 4A. Return success

- GroupSource

### Step 4B. Or Error

- Return Error as is
