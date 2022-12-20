# Data types: Create Course

## Notes

Assume everything is AND unless specified by OR and ()

## Types

### CreateCourseRequestDto

- ExternalId

## Errors

- RequestInvalidError
  - Extends: BadRequestException
  - Message: Invalid request, please review
- RepositoryAuthenticationError
  - Extends: UnauthorizedException
  - Message: Error authenticating at repository, please re-authenticate
- RepositoryItemNotFoundError
  - Extends: NotFoundException
  - Message: A source could not be found, please check source for requested record
- RepositoryServerError
  - Extends: InternalServerException
  - Message: Error connecting to repository, please try again or contact system administrator
- RepositoryServerUnavailableError
  - Extends: ServiceUnavailableException
  - Message: The repository is currently unavailable, please try again or contact system administrator
- SourceInvalidError
  - Extends: BadRequestException
  - Message: Source contains insufficient or invalid data, please review requested record at source
- RepositoryItemConflictError
  - Extends: ConflictException
  - Message: Source already exists within our database. No action required.
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

None

## Notifications

### CourseCreatedNotification

- course: SavedCourse
- subject: Course created <`SavedCourse.name`>
- message: Course <`SavedCourse.name`></br>
| created by <`Admin.name`></br>
| at <`SavedCourse.createdAt as time`></br>
| on <`SavedCourse.createdAt as date`>

### Email

- Subject: string, no longer than 80 chars
- Message: string, ideally in a template

### Source repository

- Subject: string, no longer than 80 chars
- Message: string, no longer than 150 chars
