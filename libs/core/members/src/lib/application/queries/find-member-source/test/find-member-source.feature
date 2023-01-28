Feature: Find Member Source

Scenario: Successfully finding a member source by Source Id
  Given the request is valid
  When I attempt to find a member source
  Then a record should have been returned

Scenario: Successfully finding a member source by email
  Given the request is valid
  When I attempt to find a member source
  Then a record should have been returned

Scenario: Fail; member source not found
  Given the request is valid
  And the member source does NOT exist in the DB
  When I attempt to find a member source
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a member source
  Then I should receive a RequestInvalidError
