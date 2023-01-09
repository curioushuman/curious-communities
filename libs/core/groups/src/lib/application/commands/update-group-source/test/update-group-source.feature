Feature: Update GroupSource

Scenario: Successfully updating a group source
  Given the request is valid
  And a matching record is found at the source
  When I attempt to update a group source
  Then a record should have been updated
  And saved group source is returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to update a group source
  Then I should receive a RequestInvalidError
