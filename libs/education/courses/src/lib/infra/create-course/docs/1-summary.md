# Feature Summary: Create Course

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data

### Input data:

- CreateCourseRequestDto

### Dependencies (from other services/sources)

- None, all internal

### Output (results, events, errors)

#### Success (singular result + event)

- void

### Failure (1+):

- Various internal errors
  - See Application for more info

## 3. Behaviour

### Triggered by

- Lambda function(s)

### Side-effects

- Course created

## 4. Decisions

- None

## 5. Open Questions/actions

- None
