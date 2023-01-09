# Feature Summary: Find Group

## 1. Details

- **Subdomain**: Groups
- **Aggregate root**: Groups

## 2. Data

### Input data:

- FindGroupRequestDto
  - FindByIdGroupRequestDto
  - FindBySourceIdGroupRequestDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- Group

### Failure (1+):

- Various internal errors
  - See Application for more info

## 3. Behaviour

### Triggered by

- Lambda function(s)

### Side-effects

- None

## 4. Decisions

- None

## 5. Open Questions/actions

- None
