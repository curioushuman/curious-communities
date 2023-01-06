# Feature Workflow: Find Course

## Algorithm

### Input

- FindCourseRequestDto

### Output

#### Success

- CourseResponseDto

#### Fail

- Errors (see Summary)

### Steps

1. Find course
2. Return
   1. CourseResponseDto
   2. Or Error

## Steps, detail

### Step 1. Find course

#### Input

- FindCourseRequestDto

#### Output: Success

- CourseResponseDto

#### Output: Fail

- Various internal errors
  - See ~/libs/education/courses/src/lib/application docs for more info

#### Steps (pseudocode)

```
Find Course
If Error
  return Error
Else
  return CourseResponseDto
```

### Step 2A. Return success

### Step 2B. Or error
