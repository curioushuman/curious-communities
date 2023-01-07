# Feature Workflow: Find Member Source

## Algorithm

### Input

- FindMemberSourceDto

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

- FindMemberSourceDto

#### Output: Success

- FindMemberSourceDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return FindMemberSourceDto
```

### Step 2. Find member source

#### Input

- FindMemberSourceDto

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
