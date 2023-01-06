# Feature Workflow: Update Participant

## Algorithm

### Input

- UpdateParticipantRequestDto

### Output

#### Success

- Saved participant

#### Fail

- Errors (see Summary)

### Steps

1. Update participant
2. Return
   1. Saved participant
   2. Or Error

## Steps, detail

### Step 1. Update participant

#### Input

- UpdateParticipantRequestDto

#### Output: Success

- Saved participant

#### Output: Fail

- Various internal errors
  - See ~/libs/education/participants/src/lib/application docs for more info

#### Steps (pseudocode)

```
Update Participant
If Error
  return Error
Else
  return Saved participant
```

### Step 2A. Return success

### Step 2B. Or error
