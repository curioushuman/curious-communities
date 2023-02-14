Feature: Update Group Member Source

Scenario: Successfully updating a group member source
  Given the request is valid
  And a matching record is found at the source
  When I attempt to update a group member source
  Then a record should have been updated
  And saved group member source is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a group member source
  Then I should receive a InternalRequestInvalidError
