Feature: Find Course

Scenario: Successfully finding a course
  Given the request is valid
  When I attempt to find a course
  Then a record should have been returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a course
  Then I should receive a RequestInvalidError
  And no result is returned

Scenario: Fail; internal error occurred
  Given the request is valid
  And an internal error occurs during course lookup
  When I attempt to find a course
  Then I should receive an error
  And no result is returned
