# Feature Workflow: Find Course

## Algorithm

### Input

- FindCourseDto

### Output

#### Success

- Course

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Find course
3. Return
   1. Course
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- FindCourseDto

#### Output: Success

- FindCourseDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return FindCourseDto
```

### Step 2. Find course

#### Input

- FindCourseDto

#### Output: Success

- Course

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to find course
  catch + return Error
Else
  return Course
```

### Step 4A. Return success

- Course

### Step 4B. Or Error

- Return Error as is
