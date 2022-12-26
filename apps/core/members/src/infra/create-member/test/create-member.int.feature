Feature: Create Member

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a member
  Then I should receive a RequestInvalidError
  And no result is returned
