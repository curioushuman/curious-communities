# Feature Summary: Update Course

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data

### Input data:

- UpdateCourseRequestDto

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

- None

## 5. Open Questions/actions

- None
