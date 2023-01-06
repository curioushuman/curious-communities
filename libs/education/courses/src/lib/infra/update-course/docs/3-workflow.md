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

1. Validate input
2. Update course
3. Return
   1. Saved course
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- UpdateCourseRequestDto

#### Output: Success

- DTO for createCourse command

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return createCourseDto
```

### Step 2. Update course

#### Input

- createCourseDto

#### Output: Success

- Saved course

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to create course
  catch + return Error
Else
  return CourseSource
```

### Step 4A. Return success

- Saved course

### Step 4B. Or Error

- Return Error as is
