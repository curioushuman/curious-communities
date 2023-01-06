# Feature Workflow: Find Participant

## Algorithm

### Input

- FindParticipantDto

### Output

#### Success

- Participant

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Find participant
3. Return
   1. Participant
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- FindParticipantDto

#### Output: Success

- FindParticipantDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return FindParticipantDto
```

### Step 2. Find participant

#### Input

- FindParticipantDto

#### Output: Success

- Participant

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to find participant
  catch + return Error
Else
  return Participant
```

### Step 4A. Return success

- Participant

### Step 4B. Or Error

- Return Error as is
