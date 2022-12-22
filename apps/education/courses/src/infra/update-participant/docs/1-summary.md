# Feature Summary: Update Participant

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Participants

## 2. Data

### Input data:

- UpdateParticipantRequestDto

### Dependencies (from other services/sources)

- /libs/education/participants

### Output (results, events, errors)

#### Success (singular result + event)

- void

### Failure (1+):

- Various internal errors
  - See ~/libs/education/participants/src/lib/application docs for more info

## 3. Behaviour

### Triggered by

- Eventbridge subscription

### Side-effects

- Participant created

## 4. Decisions

- None

## 5. Open Questions/actions

- None
