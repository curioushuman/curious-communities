# Feature Workflow: Find MemberSource

## Algorithm

### Input

- FindMemberSourceRequestDto

### Output

#### Success

- MemberSource

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Find member source
3. Return
   1. MemberSource
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- FindMemberSourceRequestDto

#### Output: Success

- DTO for findMemberSource query

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return findMemberSourceDto
```

### Step 2. Find member source

#### Input

- findMemberSourceDto

#### Output: Success

- MemberSource

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to find member source
  catch + return Error
Else
  return MemberSource
```

### Step 4A. Return success

- MemberSource

### Step 4B. Or Error

- Return Error as is
