# Feature Workflow: Find Group

## Algorithm

### Input

- FindGroupDto

### Output

#### Success

- Group

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Find group
3. Return
   1. Group
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input

- FindGroupDto

#### Output: Success

- FindGroupDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return FindGroupDto
```

### Step 2. Find group

#### Input

- FindGroupDto

#### Output: Success

- Group

#### Output: Fail

- Various internal errors
  - See application docs for more info

#### Steps (pseudocode)

```
Try to find group
  catch + return Error
Else
  return Group
```

### Step 4A. Return success

- Group

### Step 4B. Or Error

- Return Error as is
