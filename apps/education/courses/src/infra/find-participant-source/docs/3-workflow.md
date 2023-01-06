# Feature Workflow: Find Participant Source

## Algorithm

### Input

- FindParticipantSourceRequestDto

### Output

#### Success

- ParticipantSourceResponseDto

#### Fail

- Errors (see Summary)

### Steps

1. Find participant source
2. Return
   1. ParticipantSourceResponseDto
   2. Or Error

## Steps, detail

### Step 1. Find participant source

#### Input

- FindParticipantSourceRequestDto

#### Output: Success

- ParticipantSourceResponseDto

#### Output: Fail

- Various internal errors
  - See ~/libs/education/participants/src/lib/application docs for more info

#### Steps (pseudocode)

```
Find Participant Source
If Error
  return Error
Else
  return ParticipantSourceResponseDto
```

### Step 2A. Return success

### Step 2B. Or error
