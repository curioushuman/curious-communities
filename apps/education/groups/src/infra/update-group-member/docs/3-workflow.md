# Feature Workflow: Update GroupMember

## Algorithm

### Input

- UpdateGroupMemberRequestDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Update group-member
2. Return
   1. void
   2. Or Error

## Steps, detail

### Step 1. Update group-member

#### Input

- UpdateGroupMemberRequestDto

#### Output: Success

- void

#### Output: Fail

- Various internal errors
  - See ~/libs/education/group-members/src/lib/application docs for more info

#### Steps (pseudocode)

```
Update GroupMember
If Error
  return Error
Else
  return
```

### Step 2A. Return success

### Step 2B. Or error
