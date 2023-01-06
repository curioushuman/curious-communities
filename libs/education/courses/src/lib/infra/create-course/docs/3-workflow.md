# Feature Workflow: Create Course

## Algorithm

### Input

- CreateCourseRequestDto

### Output

#### Success

- Saved course

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Create course
3. Return
   1. Saved course
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- CreateCourseRequestDto

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

### Step 2. Create course

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
  return Course
```

### Step 4A. Return success

- Saved course

### Step 4B. Or Error

- Return Error as is
