# Feature Workflow: Create Member

## Algorithm

### Input

- CreateMemberRequestDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Create member
2. Return
   1. Saved member
   2. Or Error

## Steps, detail

### Step 1. Create member

#### Input

- CreateMemberRequestDto

#### Output: Success

- Saved member

#### Output: Fail

- Various internal errors
  - See ~/libs/core/members/src/lib/application docs for more info

#### Steps (pseudocode)

```
Create Member
If Error
  return Error
Else
  return Saved member
```

### Step 2A. Return success

### Step 2B. Or error
