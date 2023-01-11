# Feature Workflow: Find GroupMember Source

## Algorithm

### Input

- FindGroupMemberSourceDto

### Output

#### Success

- GroupMemberSource

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Find group source
3. Return
   1. GroupMemberSource
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- FindGroupMemberSourceDto

#### Output: Success

- FindGroupMemberSourceDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return FindGroupMemberSourceDto
```

### Step 2. Find group source

#### Input

- FindGroupMemberSourceDto

#### Output: Success

- GroupMemberSource

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to find group source
  catch + return Error
Else
  return GroupMemberSource
```

### Step 4A. Return success

- GroupMemberSource

### Step 4B. Or Error

- Return Error as is
