Feature: Find GroupMember

Scenario: Successfully finding a group member by Id
  Given the request is valid
  When I attempt to find a group member
  Then a record should have been returned

Scenario: Successfully finding a group member by Source Id
  Given the request is valid
  When I attempt to find a group member
  Then a record should have been returned

Scenario: Successfully finding a group member by entity
  Given the request is valid
  When I attempt to find a group member
  Then a record should have been returned

Scenario: Fail; group member not found
  Given the request is valid
  And the group member does NOT exist in the DB
  When I attempt to find a group member
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a group member
  Then I should receive a RequestInvalidError
