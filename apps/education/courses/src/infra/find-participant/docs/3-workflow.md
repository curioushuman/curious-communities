# Feature Workflow: Find Participant

## Algorithm

### Input

- FindParticipantRequestDto

### Output

#### Success

- ParticipantResponseDto

#### Fail

- Errors (see Summary)

### Steps

1. Find participant
2. Return
   1. ParticipantResponseDto
   2. Or Error

## Steps, detail

### Step 1. Find participant

#### Input

- FindParticipantRequestDto

#### Output: Success

- ParticipantResponseDto

#### Output: Fail

- Various internal errors
  - See ~/libs/education/participants/src/lib/application docs for more info

#### Steps (pseudocode)

```
Find Participant
If Error
  return Error
Else
  return ParticipantResponseDto
```

### Step 2A. Return success

### Step 2B. Or error
