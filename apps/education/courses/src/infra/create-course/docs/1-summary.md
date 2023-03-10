# Feature Summary: Create Course

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data

### Input data:

- CreateCourseRequestDto

### Dependencies (from other services/sources)

- /libs/education/courses

### Output (results, events, errors)

#### Success (singular result + event)

- Saved course

### Failure (1+):

- Various internal errors
  - See ~/libs/education/courses/src/lib/application docs for more info

## 3. Behaviour

### Triggered by

- Eventbridge subscription

### Side-effects

- Course created

## 4. Decisions

- We only support (creation of cc-courses in) external systems for now
  - In the future we might expand to allow them to use our own
- External record info not updatable from custom admin
- NO extra data administer-able from our admin
  - Only aspects such as groups etc

## 5. Open Questions/actions

- None
