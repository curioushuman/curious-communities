Feature: Create Course

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a course
  Then I should receive a RequestInvalidError
  And no result is returned
