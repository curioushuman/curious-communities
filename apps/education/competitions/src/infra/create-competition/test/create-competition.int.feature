Feature: Create Competition

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a competition
  Then I should receive a RequestInvalidError
  And no result is returned
