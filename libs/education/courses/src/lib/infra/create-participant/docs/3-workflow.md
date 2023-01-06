# Feature Workflow: Create Participant

## Algorithm

### Input

- CreateParticipantRequestDto

### Output

#### Success

- Saved participant

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Create participant
3. Return
   1. Saved participant
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- CreateParticipantRequestDto

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

### Step 2. Create participant

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
  return Participant
```

### Step 4A. Return success

- Saved participant

### Step 4B. Or Error

- Return Error as is
