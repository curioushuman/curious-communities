# Feature Workflow: Find Member

## Algorithm

### Input

- FindMemberDto

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

- FindMemberDto

#### Output: Success

- FindMemberDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return FindMemberDto
```

### Step 2. Find member

#### Input

- FindMemberDto

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
