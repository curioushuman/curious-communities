Feature: Update MemberSource

Scenario: Successfully updating a member source
  Given the request is valid
  And a matching record is found at the source
  When I attempt to update a member source
  Then a record should have been updated
  And saved member source is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a member source
  Then I should receive a RequestInvalidError
