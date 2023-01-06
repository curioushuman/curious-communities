# Feature Workflow: Find ParticipantSource

## Algorithm

### Input

- FindParticipantSourceRequestDto

### Output

#### Success

- ParticipantSource

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Find participant source
3. Return
   1. ParticipantSource
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- FindParticipantSourceRequestDto

#### Output: Success

- DTO for findParticipantSource query

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return findParticipantSourceDto
```

### Step 2. Find participant source

#### Input

- findParticipantSourceDto

#### Output: Success

- ParticipantSource

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to find participant source
  catch + return Error
Else
  return ParticipantSource
```

### Step 4A. Return success

- ParticipantSource

### Step 4B. Or Error

- Return Error as is
