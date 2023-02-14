Feature: Find GroupMember Source

Scenario: Successfully finding a groupMember source
  Given the request is valid
  When I attempt to find a groupMember source
  Then a record should have been returned

Scenario: Fail; Invalid request
  Given the request contains invalid data
  When I attempt to find a groupMember source
  Then I should receive a RequestInvalidError
  And no result is returned

Scenario: Fail; internal error occurred
  Given the request is valid
  And an internal error occurs during groupMember source lookup
  When I attempt to find a groupMember source
  Then I should receive an error
  And no result is returned
