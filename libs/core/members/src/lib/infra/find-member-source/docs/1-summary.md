# Feature Summary: Find Member

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Members

## 2. Data

### Input data:

- FindMemberRequestDto
  - FindByIdMemberRequestDto
  - FindBySourceIdMemberRequestDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- Member

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
