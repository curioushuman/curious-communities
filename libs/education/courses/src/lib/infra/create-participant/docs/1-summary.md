# Feature Summary: Create Participant

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data

### Input data:

- CreateParticipantRequestDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- Saved participant

### Failure (1+):

- Various internal errors
  - See Application for more info

## 3. Behaviour

### Triggered by

- Create participant step function

### Side-effects

- Participant created

## 4. Decisions

- None

## 5. Open Questions/actions

- None
