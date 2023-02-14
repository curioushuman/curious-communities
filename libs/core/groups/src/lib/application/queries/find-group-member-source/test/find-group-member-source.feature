Feature: Find GroupMember Source

Scenario: Successfully finding a groupMember source by Source Id
  Given the request is valid
  When I attempt to find a groupMember source
  Then a record should have been returned

Scenario: Successfully finding a groupMember source by email
  Given the request is valid
  When I attempt to find a groupMember source
  Then a record should have been returned

Scenario: Fail; groupMember source not found
  Given the request is valid
  And the groupMember source does NOT exist in the DB
  When I attempt to find a groupMember source
  Then I should receive a RepositoryItemNotFoundError

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a groupMember source
  Then I should receive a InternalRequestInvalidError
