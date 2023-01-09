# Feature Summary: Create Member

## 1. Details

- **Subdomain**: Members
- **Aggregate root**: Members

## 2. Data

### Input data:

- CreateMemberRequestDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- Saved member

### Failure (1+):

- Various internal errors
  - See Application for more info

## 3. Behaviour

### Triggered by

- Create member step function

### Side-effects

- Member created

## 4. Decisions

- None

## 5. Open Questions/actions

- None
