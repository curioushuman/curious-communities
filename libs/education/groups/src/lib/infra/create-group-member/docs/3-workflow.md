# Feature Workflow: Create GroupMember

## Algorithm

### Input

- CreateGroupMemberRequestDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Create group-member
3. Return
   1. void
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- CreateGroupMemberRequestDto

#### Output: Success

- DTO for createGroupMember command

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return createGroupMemberDto
```

### Step 2. Create group-member

#### Input

- createGroupMemberDto

#### Output: Success

- void

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to create group-member
  catch + return Error
Else
  return GroupMember
```

### Step 4A. Return success

- void

### Step 4B. Or Error

- Return Error as is
