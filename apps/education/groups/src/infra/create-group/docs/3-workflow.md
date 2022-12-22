# Feature Workflow: Create Group

## Algorithm

### Input

- CreateGroupRequestDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Create group
2. Return
   1. void
   2. Or Error

## Steps, detail

### Step 1. Create group

#### Input

- CreateGroupRequestDto

#### Output: Success

- void

#### Output: Fail

- Various internal errors
  - See ~/libs/education/groups/src/lib/application docs for more info

#### Steps (pseudocode)

```
Create Group
If Error
  return Error
Else
  return
```

### Step 2A. Return success

### Step 2B. Or error
