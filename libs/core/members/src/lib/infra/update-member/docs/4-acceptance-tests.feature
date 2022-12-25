Feature: Update Member

Scenario: Successfully updating a member
  Given the request is valid
  When I attempt to update a member
  Then the related record should have been updated in the repository
  And no result is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a member
  Then I should receive a RequestInvalidError
  And no result is returned

Scenario: Fail; internal error occurred
  Given the request is valid
  And an internal error occurs during member update
  When I attempt to update a member
  Then I should receive an error
  And no result is returned
