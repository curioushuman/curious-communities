# Feature Workflow: Find GroupMember

## Algorithm

### Input

- FindGroupMemberDto

### Output

#### Success

- GroupMember

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Find group
3. Return
   1. GroupMember
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- FindGroupMemberDto

#### Output: Success

- FindGroupMemberDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return FindGroupMemberDto
```

### Step 2. Find group

#### Input

- FindGroupMemberDto

#### Output: Success

- GroupMember

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to find group
  catch + return Error
Else
  return GroupMember
```

### Step 4A. Return success

- GroupMember

### Step 4B. Or Error

- Return Error as is
