# Data types: Create Group

## Notes

Assume everything is AND unless specified by OR and ()

## Types

### CreateGroupDto

- groupSource
  - id
  - status
- group
  - id
- group
  - id
  - name
  - email
  - organisationName

### GroupSourceForCreate

- id
- status

### GroupForCreate

- id

### Group

- id
- email
- name
- organisationName

### Group

- id
- name
- slug
- (See entity for full spec)

## Errors

- RequestInvalidError
  - Extends: BadRequestException
  - Message: Invalid request, please review
- RepositoryServerError
  - Extends: InternalServerException
  - Message: Error connecting to repository, please try again or contact system administrator
- RepositoryServerUnavailableError
  - Extends: ServiceUnavailableException
  - Message: The repository is currently unavailable, please try again or contact system administrator
- SourceInvalidError
  - Extends: BadRequestException
  - Message: Source contains insufficient or invalid data, please review requested record at source
- NotificationFailedError
  - Extends: InternalServerException
  - Message: Error sending Notification, contact your system administrator
- EventFailedError
  - Extends: InternalServerException
  - Message: Error emitting event, contact your system administrator

### By Exception extended

- BadRequestException
  - RequestInvalidError
  - SourceInvalidError
- UnauthorizedException
  - RepositoryAuthenticationError
- NotFoundException
  - RepositoryItemNotFoundError
- InternalServerException
  - RepositoryServerError
  - NotificationFailedError
  - EventFailedError
- ConflictException
  - RepositoryItemConflictError

## Events

- none

## Notifications

- none
