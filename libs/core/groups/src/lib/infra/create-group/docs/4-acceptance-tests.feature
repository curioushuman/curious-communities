Feature: Create Group

Scenario: Successfully creating a group
  Given the request is valid
  When I attempt to create a group
  Then a new record should have been created
  And saved group is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a group
  Then I should receive a RequestInvalidError

Scenario: Fail; internal error occurred
  Given the request is valid
  And an internal error occurs during group creation
  When I attempt to create a group
  Then I should receive an error
