Feature: Upsert Course

Scenario: Successfully creating a course
  Given the request is valid
  And the course does not exist in the repository
  When I attempt to upsert a course
  Then a new record should have been created in the repository
  And saved course is returned within payload

Scenario: Successfully updating a course
  Given the request is valid
  And the course exists in the repository
  When I attempt to upsert a course
  Then an existing record should have been updated in the repository
  And saved course is returned within payload

# TODO - no change

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a course
  Then I should receive a SourceInvalidError

# TODO - needs to be implemented
# Scenario: Fail; internal error occurred
#   Given the request is valid
#   And an internal error occurs during course creation
#   When I attempt to create a course
#   Then I should receive an error
#   And no result is returned
