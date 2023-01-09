# Feature Summary: Create Group

## 1. Details

- **Subdomain**: Groups
- **Aggregate root**: Groups

## 2. Data

### Input data:

- CreateGroupRequestDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- Saved group

### Failure (1+):

- Various internal errors
  - See Application for more info

## 3. Behaviour

### Triggered by

- Create group step function

### Side-effects

- Group created

## 4. Decisions

- None

## 5. Open Questions/actions

- None
