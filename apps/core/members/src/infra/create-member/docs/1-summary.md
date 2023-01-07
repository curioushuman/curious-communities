# Feature Summary: Create Member

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Members

## 2. Data

### Input data:

- CreateMemberRequestDto

### Dependencies (from other services/sources)

- /libs/core/members

### Output (results, events, errors)

#### Success (singular result + event)

- Saved member

### Failure (1+):

- Various internal errors
  - See ~/libs/core/members/src/lib/application docs for more info

## 3. Behaviour

### Triggered by

- Eventbridge subscription

### Side-effects

- Member created

## 4. Decisions

- We only support (creation of cc-members in) external systems for now
  - In the future we might expand to allow them to use our own
- External record info not updatable from custom admin
- NO extra data administer-able from our admin
  - Only aspects such as groups etc

## 5. Open Questions/actions

- None
