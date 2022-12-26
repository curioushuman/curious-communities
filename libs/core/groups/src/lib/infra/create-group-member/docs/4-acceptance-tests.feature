Feature: Create GroupMember

Scenario: Successfully creating a group-member
  Given the request is valid
  When I attempt to create a group-member
  Then a new record should have been created in the repository
  And no result is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to create a group-member
  Then I should receive a RequestInvalidError
  And no result is returned

Scenario: Fail; internal error occurred
  Given the request is valid
  And an internal error occurs during group-member creation
  When I attempt to create a group-member
  Then I should receive an error
  And no result is returned
