# Feature Summary: Create Group

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Groups

## 2. Data

### Input data:

- CreateGroupRequestDto

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

- We only support (creation of cc-groups in) external systems for now
  - In the future we might expand to allow them to use our own
- External record info not updatable from custom admin
- NO extra data administer-able from our admin
  - Only aspects such as groups etc

## 5. Open Questions/actions

- None
