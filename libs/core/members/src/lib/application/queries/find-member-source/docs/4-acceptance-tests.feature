Feature: Find Member Source

Scenario: Successfully finding a member source
  Given the request is valid
  When I attempt to find a member source
  Then a record should have been returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a member source
  Then I should receive a RequestInvalidError
  And no result is returned

Scenario: Fail; internal error occurred
  Given the request is valid
  And an internal error occurs during member source lookup
  When I attempt to find a member source
  Then I should receive an error
  And no result is returned
