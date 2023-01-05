# Feature Summary: Find Participant

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data

### Input data:

- FindParticipantRequestDto

### Dependencies (from other services/sources)

- /libs/education/participants

### Output (results, events, errors)

#### Success (singular result + event)

- ParticipantResponseDto

### Failure (1+):

- Various internal errors
  - See ~/libs/education/participants/src/lib/application docs for more info

## 3. Behaviour

### Triggered by

- Create Participant step functions
- External API (but not yet)

### Side-effects

- None

## 4. Decisions

- None

## 5. Open Questions/actions

- None
