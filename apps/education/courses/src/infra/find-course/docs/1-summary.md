# Feature Summary: Find Course

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data

### Input data:

- FindCourseRequestDto

### Dependencies (from other services/sources)

- /libs/education/courses

### Output (results, events, errors)

#### Success (singular result + event)

- CourseResponseDto

### Failure (1+):

- Various internal errors
  - See ~/libs/education/courses/src/lib/application docs for more info

## 3. Behaviour

### Triggered by

- Create Course step functions
- External API (but not yet)

### Side-effects

- None

## 4. Decisions

- None

## 5. Open Questions/actions

- None
