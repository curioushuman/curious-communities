# Feature Workflow: Find Member

## Algorithm

### Input

- FindMemberRequestDto

### Output

#### Success

- MemberResponseDto

#### Fail

- Errors (see Summary)

### Steps

1. Find member
2. Return
   1. MemberResponseDto
   2. Or Error

## Steps, detail

### Step 1. Find member

#### Input

- FindMemberRequestDto

#### Output: Success

- MemberResponseDto

#### Output: Fail

- Various internal errors
  - See ~/libs/core/members/src/lib/application docs for more info

#### Steps (pseudocode)

```
Find Member
If Error
  return Error
Else
  return MemberResponseDto
```

### Step 2A. Return success

### Step 2B. Or error
