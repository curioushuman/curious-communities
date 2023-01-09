# Feature Workflow: Update Member

## Algorithm

### Input

- UpdateMemberRequestDto

### Output

#### Success

- Saved member

#### Fail

- Errors (see Summary)

### Steps

1. Update member
2. Return
   1. Saved member
   2. Or Error

## Steps, detail

### Step 1. Update member

#### Input

- UpdateMemberRequestDto

#### Output: Success

- Saved member

#### Output: Fail

- Various internal errors
  - See ~/libs/core/members/src/lib/application docs for more info

#### Steps (pseudocode)

```
Update Member
If Error
  return Error
Else
  return Saved member
```

### Step 2A. Return success

### Step 2B. Or error
