# Feature Summary: Upsert Group Source

## 1. Details

- **Subdomain**: Groups
- **Aggregate root**: Groups

## 2. Data

### Input data:

- UpsertGroupSourceRequestDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- GroupSource

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
