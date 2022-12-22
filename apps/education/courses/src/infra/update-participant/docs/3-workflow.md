# Feature Workflow: Update Participant

## Algorithm

### Input

- UpdateParticipantRequestDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Update participant
2. Return
   1. void
   2. Or Error

## Steps, detail

### Step 1. Update participant

#### Input

- UpdateParticipantRequestDto

#### Output: Success

- void

#### Output: Fail

- Various internal errors
  - See ~/libs/education/participants/src/lib/application docs for more info

#### Steps (pseudocode)

```
Update Participant
If Error
  return Error
Else
  return
```

### Step 2A. Return success

### Step 2B. Or error
