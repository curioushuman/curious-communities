# Feature Workflow: Create Course

## Algorithm

### Input

- CreateCourseRequestDto

### Output

#### Success

- void

#### Fail

- Errors (see Summary)

### Steps

1. Create course
2. Return
   1. Saved course
   2. Or Error

## Steps, detail

### Step 1. Create course

#### Input

- CreateCourseRequestDto

#### Output: Success

- Saved course

#### Output: Fail

- Various internal errors
  - See ~/libs/education/courses/src/lib/application docs for more info

#### Steps (pseudocode)

```
Create Course
If Error
  return Error
Else
  return Saved course
```

### Step 2A. Return success

### Step 2B. Or error
