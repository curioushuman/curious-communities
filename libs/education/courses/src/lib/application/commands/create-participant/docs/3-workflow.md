# Feature Workflow: Create Participant

## Algorithm

### Input
- CreateParticipantDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Build participant record from DTO
2. Save participant
3. Return
   1. void
   2. Error

## Steps, detail

### Step 1. Build participant record from DTO

#### Input
- CreateParticipantDto

#### Output: Success

- Participant

#### Output: Fail

- SourceInvalidError

#### Steps (pseudocode)

```
Build Participant from Source
If invalid
  Return SourceInvalidError
Build Participant from Course
If invalid
  Return SourceInvalidError
Build Participant from Member
If invalid
  Return SourceInvalidError
Return Participant
```

### Step 2. Save participant

#### Input
- Participant

#### Output: Success

- void

#### Output: Fail

- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Save Participant
If Fails
  return RepositoryServerError
Else
  return void
```

### Step 5A. Return success

- void

### Step 5B. Or Error

- Return Error as is
