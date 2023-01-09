# Feature Summary: Upsert Member Source

## 1. Details

- **Subdomain**: Members
- **Aggregate root**: Members

## 2. Data

### Input data:

- UpsertMemberSourceRequestDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- MemberSource

### Failure (1+):

- Various internal errors
  - See Application for more info

## 3. Behaviour

### Triggered by

- Internal Eventbus

### Side-effects

- None

## 4. Decisions

- None

## 5. Open Questions/actions

- None
