Feature: Find Course

Scenario: Successfully finding a course by Id
  Given the request is valid
  When I attempt to find a course
  Then a record should have been returned

Scenario: Successfully finding a course by Source Id
  Given the request is valid
  When I attempt to find a course
  Then a record should have been returned

Scenario: Fail; course not found
  Given the request is valid
  And the course does NOT exist in the DB
  When I attempt to find a course
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a course
  Then I should receive a RequestInvalidError
