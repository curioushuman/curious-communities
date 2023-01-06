Feature: Find Course

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a course
  Then I should receive a RequestInvalidError
  And no result is returned
