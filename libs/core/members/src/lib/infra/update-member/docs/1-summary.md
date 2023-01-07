# Feature Summary: Update Member

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Members

## 2. Data

### Input data:

- UpdateMemberRequestDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- Saved member

### Failure (1+):

- Various internal errors
  - See application docs for more info

## 3. Behaviour

### Triggered by

- Lambda function(s)

### Side-effects

- Member created

## 4. Decisions

- None

## 5. Open Questions/actions

- None
