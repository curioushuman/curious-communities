# Feature Summary: Update Member

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Members

## 2. Data

### Input data:

- UpdateMemberRequestDto

### Dependencies (from other services/sources)

- /libs/core/members

### Output (results, events, errors)

#### Success (singular result + event)

- void

### Failure (1+):

- Various internal errors
  - See ~/libs/core/members/src/lib/application docs for more info

## 3. Behaviour

### Triggered by

- Eventbridge subscription

### Side-effects

- Member created

## 4. Decisions

- None

## 5. Open Questions/actions

- None
