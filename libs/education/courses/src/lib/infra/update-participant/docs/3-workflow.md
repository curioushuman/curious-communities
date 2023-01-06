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

1. Validate input
2. Update participant
3. Return
   1. Saved participant
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- UpdateParticipantRequestDto

#### Output: Success

- DTO for createParticipant command

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return createParticipantDto
```

### Step 2. Update participant

#### Input

- createParticipantDto

#### Output: Success

- Saved participant

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to create participant
  catch + return Error
Else
  return ParticipantSource
```

### Step 4A. Return success

- Saved participant

### Step 4B. Or Error

- Return Error as is
