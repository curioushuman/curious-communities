# Feature Workflow: Update Course

## Algorithm

### Input

- UpdateCourseRequestDto

### Output

#### Success

- Saved course

#### Fail

- Errors (see Summary)

### Steps

1. Update course
2. Return
   1. Saved course
   2. Or Error

## Steps, detail

### Step 1. Update course

#### Input

- UpdateCourseRequestDto

#### Output: Success

- Saved course

#### Output: Fail

- Various internal errors
  - See ~/libs/education/courses/src/lib/application docs for more info

#### Steps (pseudocode)

```
Update Course
If Error
  return Error
Else
  return Saved course
```

### Step 2A. Return success

### Step 2B. Or error
