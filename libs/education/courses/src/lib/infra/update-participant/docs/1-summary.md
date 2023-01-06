# Feature Summary: Update Participant

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data

### Input data:

- UpdateParticipantRequestDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- Saved participant

### Failure (1+):

- Various internal errors
  - See application docs for more info

## 3. Behaviour

### Triggered by

- Lambda function(s)

### Side-effects

- Participant created

## 4. Decisions

- None

## 5. Open Questions/actions

- None
