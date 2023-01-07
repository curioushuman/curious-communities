# Feature Workflow: Find Member

## Algorithm

### Input

- FindMemberRequestDto

### Output

#### Success

- Member

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Find member
3. Return
   1. Member
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- FindMemberRequestDto

#### Output: Success

- DTO for findMember query

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return findMemberDto
```

### Step 2. Find member

#### Input

- findMemberDto

#### Output: Success

- Member

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to find member
  catch + return Error
Else
  return Member
```

### Step 4A. Return success

- Member

### Step 4B. Or Error

- Return Error as is
