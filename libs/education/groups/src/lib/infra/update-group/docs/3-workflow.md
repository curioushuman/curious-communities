# Feature Workflow: Update Group

## Algorithm

### Input

- UpdateGroupRequestDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Update group
3. Return
   1. void
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- UpdateGroupRequestDto

#### Output: Success

- DTO for createGroup command

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return createGroupDto
```

### Step 2. Update group

#### Input

- createGroupDto

#### Output: Success

- void

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to create group
  catch + return Error
Else
  return GroupSource
```

### Step 4A. Return success

- void

### Step 4B. Or Error

- Return Error as is
