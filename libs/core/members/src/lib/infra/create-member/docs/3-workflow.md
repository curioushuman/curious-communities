# Feature Workflow: Create Member

## Algorithm

### Input

- CreateMemberRequestDto

### Output

#### Success

- Saved member

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Create member
3. Return
   1. Saved member
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- CreateMemberRequestDto

#### Output: Success

- DTO for createMember command

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return createMemberDto
```

### Step 2. Create member

#### Input

- createMemberDto

#### Output: Success

- Saved member

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to create member
  catch + return Error
Else
  return Member
```

### Step 4A. Return success

- Saved member

### Step 4B. Or Error

- Return Error as is
