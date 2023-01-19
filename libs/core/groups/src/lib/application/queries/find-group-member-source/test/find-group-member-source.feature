Feature: Find GroupMember Source

Scenario: Successfully finding a group member source by Source Id
  Given the request is valid
  When I attempt to find a group member source
  Then a record should have been returned

Scenario: Successfully finding a group member source from non-primary source
  Given the request is valid
  When I attempt to find a group member source
  Then a record should have been returned

Scenario: Fail; group member source not found
  Given the request is valid
  And the group member source does NOT exist in the DB
  When I attempt to find a group member source
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a group member source
  Then I should receive a RequestInvalidError
