Feature: Create Course

Scenario: Successfully creating a course
  Given the request is valid
  And a matching record is found at the source
  When I attempt to create a course
  Then a new record should have been created in the repository
  And saved course is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a course
  Then I should receive a RequestInvalidError

Scenario: Fail; Source not found for ID provided
  Given no record exists that matches our request
  When I attempt to create a course
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Source does not translate into a valid Course
  Given a matching record is found at the source
  And the returned source does not populate a valid Course
  When I attempt to create a course
  Then I should receive a SourceInvalidError

Scenario: Fail; Source already exists in our DB
  Given a matching record is found at the source
  And the source DOES already exist in our DB
  When I attempt to create a course
  Then I should receive a RepositoryItemConflictError

# TODO - needs to be implemented
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during course creation
#   When I attempt to create a course
#   Then I should receive an error
#   And no result is returned
