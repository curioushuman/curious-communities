# Feature Workflow: Create Participant

## Algorithm

### Input

- CreateParticipantRequestDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Create participant
2. Return
   1. void
   2. Or Error

## Steps, detail

### Step 1. Create participant

#### Input

- CreateParticipantRequestDto

#### Output: Success

- void

#### Output: Fail

- Various internal errors
  - See ~/libs/education/participants/src/lib/application docs for more info

#### Steps (pseudocode)

```
Create Participant
If Error
  return Error
Else
  return
```

### Step 2A. Return success

### Step 2B. Or error
