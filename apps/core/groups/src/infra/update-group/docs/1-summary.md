# Feature Summary: Update Group

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Groups

## 2. Data

### Input data:

- UpdateGroupRequestDto

### Dependencies (from other services/sources)

- /libs/core/groups

### Output (results, events, errors)

#### Success (singular result + event)

- void

### Failure (1+):

- Various internal errors
  - See ~/libs/core/groups/src/lib/application docs for more info

## 3. Behaviour

### Triggered by

- Eventbridge subscription

### Side-effects

- Group created

## 4. Decisions

- None

## 5. Open Questions/actions

- None
