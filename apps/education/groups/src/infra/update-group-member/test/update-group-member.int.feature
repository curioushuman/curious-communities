Feature: Update GroupMember

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a group-member
  Then I should receive a RequestInvalidError
  And no result is returned
