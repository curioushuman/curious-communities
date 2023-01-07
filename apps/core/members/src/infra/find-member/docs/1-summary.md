# Feature Summary: Find Member

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Members

## 2. Data

### Input data:

- FindMemberRequestDto

### Dependencies (from other services/sources)

- /libs/core/members

### Output (results, events, errors)

#### Success (singular result + event)

- MemberResponseDto

### Failure (1+):

- Various internal errors
  - See ~/libs/core/members/src/lib/application docs for more info

## 3. Behaviour

### Triggered by

- Create Member step functions
- External API (but not yet)

### Side-effects

- None

## 4. Decisions

- None

## 5. Open Questions/actions

- None
