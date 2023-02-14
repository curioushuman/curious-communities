Feature: Find Group

Scenario: Successfully finding a group by Id
  Given the request is valid
  When I attempt to find a group
  Then a record should have been returned

Scenario: Successfully finding a group by Source Id
  Given the request is valid
  When I attempt to find a group
  Then a record should have been returned

Scenario: Successfully finding a group by slug
  Given the request is valid
  When I attempt to find a group
  Then a record should have been returned

Scenario: Successfully finding a group by Course Id
  Given the request is valid
  When I attempt to find a group
  Then a record should have been returned

Scenario: Fail; group not found
  Given the request is valid
  And the group does NOT exist in the DB
  When I attempt to find a group
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a group
  Then I should receive a InternalRequestInvalidError
