Feature: Find GroupSource

Scenario: Successfully finding a group-source by Source Id
  Given the request is valid
  When I attempt to find a group-source
  Then a record should have been returned

Scenario: Successfully finding a group-source by name
  Given the request is valid
  When I attempt to find a group-source
  Then a record should have been returned

Scenario: Fail; group-source not found
  Given the request is valid
  And the group-source does NOT exist in the DB
  When I attempt to find a group-source
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a group-source
  Then I should receive a InternalRequestInvalidError
